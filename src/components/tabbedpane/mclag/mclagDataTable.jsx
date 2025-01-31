import { useEffect, useState, useRef, useCallback, useMemo } from "react";
import { AgGridReact } from "ag-grid-react";
import "ag-grid-community/styles/ag-grid.css";
import "ag-grid-community/styles/ag-theme-alpine.css";

import MclagForm from "./mclagForm";
import MclagMemberForm from "./mclagMemberForm";

import { mclagColumns, defaultColDef } from "../datatablesourse";
import { getAllMclagsOfDeviceURL } from "../../../utils/backend_rest_urls";
import interceptor from "../../../utils/interceptor";
import Modal from "../../modal/Modal";

import { getIsStaff } from "../../../utils/common";
import { getInterfaceDataCommon } from "../interfaces/interfaceDataTable";
import { getPortChannelDataCommon } from "../portchannel/portChDataTable";
import useStoreLogs from "../../../utils/store";
import useStoreConfig from "../../../utils/configStore";

import { syncFeatureCommon } from "../Deviceinfo";
import secureLocalStorage from "react-secure-storage";

const McLagDataTable = (props) => {
    const instance = interceptor();
    const theme = useMemo(() => {
        if (secureLocalStorage.getItem("theme") === "dark") {
          return "ag-theme-alpine-dark";
        } else {
          return "ag-theme-alpine";
        }
      }, []);
    const gridRef = useRef();
    const [dataTable, setDataTable] = useState([]);
    const [configStatus, setConfigStatus] = useState("");
    const [selectedRows, setSelectedRows] = useState([]);
    const [changes, setChanges] = useState([]);
    const [ethernetPortchannelList, setEthernetPortchannelList] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState("null");
    const [modalContent, setModalContent] = useState("");

    const selectedDeviceIp = props.selectedDeviceIp;
    const setUpdateLog = useStoreLogs((state) => state.setUpdateLog);
    const setUpdateConfig = useStoreConfig((state) => state.setUpdateConfig);
    const updateConfig = useStoreConfig((state) => state.updateConfig);

    useEffect(() => {
        if (props.refresh && Object.keys(changes).length !== 0) {
            setChanges([]);
            getMclag();
        }
        props.reset(false);
    }, [props.refresh]);

    useEffect(() => {
        getMclag();
    }, [selectedDeviceIp]);

    const getMclag = () => {
        setDataTable([]);
        const apiMUrl = getAllMclagsOfDeviceURL(selectedDeviceIp);
        instance
            .get(apiMUrl)
            .then((res) => {
                let data = res.data.map((item) => {
                    if (item.fast_convergence === null) {
                        item.fast_convergence = "disable";
                    }
                    item.mclag_members = JSON.stringify(item.mclag_members);
                    return item;
                });

                setDataTable(data);

                getInterfaceDataCommon(selectedDeviceIp).then((res) => {
                    const ethernentNames = res
                        .filter((item) => item?.name?.includes("Ethernet"))
                        .map((item) => item?.name);

                    getPortChannelDataCommon(selectedDeviceIp).then((res) => {
                        const portchannelNames = res.map(
                            (item) => item.lag_name
                        );

                        setEthernetPortchannelList([
                            ...ethernentNames,
                            ...portchannelNames,
                        ]);
                    });
                });
            })
            .catch((err) => {})
            .finally(() => {});
    };

    const reload = () => {
        setSelectedRows([]);
        getMclag();
        setConfigStatus("");
        setIsModalOpen("null");
    };

    const handleFormSubmit = (formData) => {
        if (Array.isArray(formData)) {
            formData.map((item) => {
                item.domain_id = selectedRows?.domain_id;
                return item;
            });
        }

        setUpdateConfig(true);
        const apiPUrl = getAllMclagsOfDeviceURL(selectedDeviceIp);
        instance
            .put(apiPUrl, formData)
            .then((res) => {})
            .catch((err) => {})
            .finally(() => {
                setUpdateLog(true);
                setUpdateConfig(false);

                reload();
            });
    };

    const deleteMclag = () => {
        setUpdateConfig(true);

        const output = {
            mgt_ip: selectedDeviceIp,
        };

        const apiPUrl = getAllMclagsOfDeviceURL(selectedDeviceIp);
        instance
            .delete(apiPUrl, { data: output })
            .then((res) => {})
            .catch((err) => {})
            .finally(() => {
                setUpdateLog(true);
                setUpdateConfig(false);

                reload();
            });
    };

    const handleDelete = () => {
        setIsModalOpen("deleteMclag");

        selectedRows?.forEach((element) => {
            setModalContent(
                "Do you want to delete Mclag with id " + element?.domain_id
            );
        });
    };

    const openAddFormModal = () => {
        setIsModalOpen("addMclag");
    };

    const onSelectionChanged = () => {
        const selectedNodes = gridRef.current.api.getSelectedNodes();
        const selectedData = selectedNodes.map((node) => node.data);
        setSelectedRows(selectedData);
    };

    const handleCellValueChanged = useCallback((params) => {
        if (
            params.data.mclag_sys_mac !== null &&
            params.data.mclag_sys_mac !== "" &&
            !/^([0-9A-Fa-f]{2}[:-]){5}([0-9A-Fa-f]{2})$/.test(
                params.data.mclag_sys_mac
            )
        ) {
            alert("Invalid MAC address.");
            return;
        }

        if (
            params.data.source_address !== null &&
            params.data.source_address !== "" &&
            !/^((25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/.test(
                params.data.source_address
            )
        ) {
            alert("Invalid source_address format.");
            return;
        }
        if (
            params.data.peer_addr !== null &&
            params.data.peer_addr !== "" &&
            !/^((25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/.test(
                params.data.peer_addr
            )
        ) {
            alert("Invalid peer_addr format.");
            return;
        }

        if (params.data.domain_id < 0) {
            alert("Domain id cannot be less than 0.");
            return;
        }

        if (params.data.domain_id < 0) {
            alert("Domain id cannot be less than 0.");
            return;
        }

        if (params.newValue !== params.oldValue) {
            setChanges((prev) => {
                let latestChanges;
                let isNameExsits = prev.filter(
                    (val) => val.vlanid === params.data.vlanid
                );
                if (isNameExsits.length > 0) {
                    let existedIndex = prev.findIndex(
                        (val) => val.vlanid === params.data.vlanid
                    );
                    prev[existedIndex][params.colDef.field] = params.newValue;
                    latestChanges = [...prev];
                } else {
                    latestChanges = [
                        ...prev,
                        {
                            mgt_ip: selectedDeviceIp,
                            [params.colDef.field]: params.newValue || "",
                        },
                    ];
                }
                return latestChanges;
            });
        }
    }, []);

    const onCellClicked = useCallback((params) => {
        if (params?.colDef?.field === "mclag_members") {
            setIsModalOpen("memberMclag");
        }
        setSelectedRows(params.data);
    }, []);

    const gridStyle = useMemo(
        () => ({
            height: props.height - 75 + "px",
            width: "100%",
        }),
        [props.height]
    );

    const resyncMclag = async () => {
        let payload = {
            mgt_ip: selectedDeviceIp,
            feature: "mclag",
        };
        setConfigStatus("Sync In Progress....");
        await syncFeatureCommon(payload, (status) => {
            setUpdateConfig(status);
            setUpdateLog(!status);
            if (!status) {
                reload();
            }
        });
    };

    return (
        <div className="datatable">
            <div className="button-group mt-5 mb-5">
                <div>
                    <button
                        className="btnStyle m-10"
                        onClick={resyncMclag}
                        disabled={updateConfig}
                    >
                         Rediscover
                    </button>

                    <button
                        disabled={
                            updateConfig || Object.keys(changes).length === 0
                        }
                        className="btnStyle m-10"
                        onClick={() => handleFormSubmit(changes)}
                    >
                        Apply Config
                    </button>
                    <span className="configStatus">{configStatus}</span>
                </div>

                <div>
                    <button
                        className="btnStyle m-10"
                        disabled={!getIsStaff()}
                        onClick={openAddFormModal}
                    >
                        Add Mclag
                    </button>

                    <button
                        className="btnStyle m-10"
                        disabled={
                            selectedRows.length === undefined ||
                            selectedRows.length === 0
                        }
                        onClick={handleDelete}
                    >
                        Delete Mclag
                    </button>
                </div>
            </div>

            <div style={gridStyle} className={theme}>
                <AgGridReact
                    ref={gridRef}
                    rowData={dataTable}
                    columnDefs={mclagColumns(ethernetPortchannelList)}
                    defaultColDef={defaultColDef}
                    stopEditingWhenCellsLoseFocus={true}
                    onCellValueChanged={handleCellValueChanged}
                    enableCellTextSelection="true"
                    onSelectionChanged={onSelectionChanged}
                    onCellClicked={onCellClicked}
                    rowSelection="multiple"
                    suppressRowClickSelection={true}
                ></AgGridReact>
            </div>

            {isModalOpen === "addMclag" && (
                <Modal
                    show={true}
                    onClose={reload}
                    title={"Add Mclag"}
                    onSubmit={(e) => handleFormSubmit(e)}
                >
                    <MclagForm selectedDeviceIp={selectedDeviceIp} />
                </Modal>
            )}

            {isModalOpen === "memberMclag" && (
                <Modal
                    show={true}
                    onClose={reload}
                    title={"Add Mclag Members"}
                    onSubmit={(e) => handleFormSubmit(e)}
                >
                    <MclagMemberForm
                        inputData={selectedRows}
                        selectedDeviceIp={selectedDeviceIp}
                    />
                </Modal>
            )}

            {isModalOpen === "deleteMclag" && (
                <Modal show={true} onClose={reload}>
                    <div>
                        {modalContent}
                        <div
                            style={{
                                marginTop: "10px",
                                display: "flex",
                                justifyContent: "center",
                                gap: "10px",
                            }}
                        >
                            <button className="btnStyle" onClick={deleteMclag}>
                                Yes
                            </button>
                            <button className="btnStyle" onClick={reload}>
                                No
                            </button>
                        </div>
                    </div>
                </Modal>
            )}
        </div>
    );
};

export default McLagDataTable;
