import { useEffect, useState, useRef, useCallback, useMemo } from "react";
import { AgGridReact } from "ag-grid-react";
import "ag-grid-community/styles/ag-grid.css";
import "ag-grid-community/styles/ag-theme-alpine.css";

import "../tabbedPaneTable.scss";
import MclagForm from "./mclagForm";
import MclagMemberForm from "./mclagMemberForm";

import { mclagColumns, defaultColDef } from "../datatablesourse";
import {
    getAllMclagsOfDeviceURL,
    getAllPortChnlsOfDeviceURL,
    getAllInterfacesOfDeviceURL,
} from "../../../utils/backend_rest_urls";
import interceptor from "../../../utils/interceptor";
import Modal from "../../modal/Modal";

import { useLog } from "../../../utils/logpannelContext";
import { useDisableConfig } from "../../../utils/dissableConfigContext";
import { getIsStaff } from "../datatablesourse";

const McLagDataTable = (props) => {
    const instance = interceptor();

    const gridRef = useRef();
    const gridStyle = useMemo(() => ({ height: "90%", width: "100%" }), []);
    const [dataTable, setDataTable] = useState([]);
    const [configStatus, setConfigStatus] = useState("");
    const [selectedRows, setSelectedRows] = useState([]);
    const [changes, setChanges] = useState([]);
    const [ethernetPortchannelList, setEthernetPortchannelList] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState("null");
    const [modalContent, setModalContent] = useState("");
    const { setLog } = useLog();
    const { disableConfig, setDisableConfig } = useDisableConfig();

    const selectedDeviceIp = props.selectedDeviceIp;

    useEffect(() => {
        if (props.refresh && Object.keys(changes).length !== 0) {
            setChanges([]);
            getMclag();
        }
        props.reset(false);
    }, [props.refresh]);

    useEffect(() => {
        getMclag();
        getPortchannel();
    }, [selectedDeviceIp]);

    const getPortchannel = () => {
        const apiPUrl = getAllPortChnlsOfDeviceURL(selectedDeviceIp);
        instance
            .get(apiPUrl)
            .then((res) => {
                const names = res.data.map((item) => item.lag_name);

                setEthernetPortchannelList(names);
            })
            .catch((err) => {
                console.log(err);
            })
            .finally(() => {
                getInterfaceData();
            });
    };

    const getInterfaceData = () => {
        const apiUrl = getAllInterfacesOfDeviceURL(selectedDeviceIp);
        instance
            .get(apiUrl)
            .then((res) => {
                const names = res.data
                    .filter((item) => item.name.includes("Ethernet"))
                    .map((item) => item.name);

                setEthernetPortchannelList((prevState) => [
                    ...prevState,
                    ...names,
                ]);
            })
            .catch((err) => {
                console.log(err);
            });
    };

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
            })
            .catch((err) => console.log(err));
    };

    const refreshData = () => {
        getMclag();
        setConfigStatus("");
        setIsModalOpen("null");
    };

    const resetConfigStatus = () => {
        setConfigStatus("");
    };

    const handleFormSubmit = (formData) => {
        if (Array.isArray(formData)) {
            formData.map((item) => {
                item.domain_id = selectedRows.domain_id;
                return item;
            });
        }

        console.log(formData);
        setDisableConfig(true);
        const apiPUrl = getAllMclagsOfDeviceURL(selectedDeviceIp);
        instance
            .put(apiPUrl, formData)
            .then((res) => {})
            .catch((err) => {})
            .finally(() => {
                setLog(true);
                setDisableConfig(false);
                resetConfigStatus();
                refreshData();
            });
    };

    const onSelectionChanged = () => {
        const selectedNodes = gridRef.current.api.getSelectedNodes();
        const selectedData = selectedNodes.map((node) => node.data);
        setSelectedRows(selectedData);
    };

    const deleteMclag = () => {
        setDisableConfig(true);

        const output = {
            mgt_ip: selectedDeviceIp,
        };

        const apiPUrl = getAllMclagsOfDeviceURL(selectedDeviceIp);
        instance
            .delete(apiPUrl, { data: output })
            .then((res) => {})
            .catch((err) => {})
            .finally(() => {
                setLog(true);
                setDisableConfig(false);
                setSelectedRows([]);
                refreshData();
            });
    };

    const handleDelete = () => {
        setIsModalOpen("deleteMclag");

        selectedRows.forEach((element) => {
            setModalContent(
                "Do you want to delete Mclag with id " + element.domain_id
            );
        });
    };

    const openAddFormModal = () => {
        setIsModalOpen("addMclag");
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
        // if (params.newValue !== params.oldValue) {
        //     let payload = {
        //         mgt_ip: selectedDeviceIp,
        //         ...params.data,
        //     };

        //     setChanges(payload);
        // }
    }, []);

    const onColumnResized = useCallback((params) => {}, []);

    const onCellClicked = useCallback((params) => {
        if (params?.colDef?.field === "mclag_members") {
            setIsModalOpen("memberMclag");
        }
        setSelectedRows(params.data);
    }, []);

    return (
        <div className="datatable">
            <div className="button-group stickyButton">
                <div className="button-column">
                    <button
                        disabled={
                            disableConfig || Object.keys(changes).length === 0
                        }
                        className="btnStyle"
                        onClick={() => handleFormSubmit(changes)}
                    >
                        Apply Config
                    </button>
                    <span className="config-status">{configStatus}</span>
                </div>

                <div className="">
                    <button
                        className="btnStyle"
                        disabled={!getIsStaff()}
                        onClick={openAddFormModal}
                    >
                        Add Mclag
                    </button>

                    <button
                        className="ml-10 btnStyle"
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

            <div style={gridStyle} className="ag-theme-alpine pt-60">
                <AgGridReact
                    ref={gridRef}
                    rowData={dataTable}
                    columnDefs={mclagColumns(ethernetPortchannelList)}
                    defaultColDef={defaultColDef}
                    onColumnResized={onColumnResized}
                    stopEditingWhenCellsLoseFocus={true}
                    onCellValueChanged={handleCellValueChanged}
                    enableCellTextSelection="true"
                    rowSelection="multiple"
                    onSelectionChanged={onSelectionChanged}
                    onCellClicked={onCellClicked}
                    domLayout={"autoHeight"}
                    suppressRowClickSelection={true}
                ></AgGridReact>
            </div>

            {isModalOpen === "addMclag" && (
                <Modal show={true} onClose={refreshData} title={"Add Mclag"}>
                    <MclagForm
                        onSubmit={(e) => handleFormSubmit(e)}
                        selectedDeviceIp={selectedDeviceIp}
                        onCancel={refreshData}
                        handelSubmitButton={disableConfig}
                    />
                </Modal>
            )}

            {isModalOpen === "memberMclag" && (
                <Modal
                    show={true}
                    onClose={refreshData}
                    title={"Add Mclag Members"}
                >
                    <MclagMemberForm
                        onSubmit={(e) => handleFormSubmit(e)}
                        inputData={selectedRows}
                        selectedDeviceIp={selectedDeviceIp}
                        onCancel={refreshData}
                        handelSubmitButton={disableConfig}
                    />
                </Modal>
            )}

            {isModalOpen === "deleteMclag" && (
                <Modal show={true}>
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
                            <button className="btnStyle" onClick={refreshData}>
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
