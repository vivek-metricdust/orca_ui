import { useEffect, useState, useRef, useCallback, useMemo } from "react";
import "../tabbedPaneTable.scss";
import { AgGridReact } from "ag-grid-react";
import "ag-grid-community/styles/ag-grid.css";
import "ag-grid-community/styles/ag-theme-alpine.css";
import { portChannelColumns } from "../datatablesourse";
import {
    getAllInterfacesOfDeviceURL,
    getAllPortChnlsOfDeviceURL,
} from "../../../utils/backend_rest_urls";
import PortChannelForm from "./PortChannelForm";
import Modal from "../../modal/Modal";
import MembersSelection from "./MembersSelection";
import interceptor from "../../../utils/interceptor";
import { useLog } from "../../../utils/logpannelContext";
import { useDisableConfig } from "../../../utils/dissableConfigContext";
import { getIsStaff } from "../datatablesourse";

const PortChDataTable = (props) => {
    const gridRef = useRef();
    const gridStyle = useMemo(
        () => ({ height: "90%", width: "100%", maxWidth: "100%" }),
        []
    );
    const [dataTable, setDataTable] = useState([]);
    const [changes, setChanges] = useState([]);
    const [originalData, setOriginalData] = useState([]);
    const [configStatus, setConfigStatus] = useState("");

    const [isModalOpen, setIsModalOpen] = useState("null");
    const [modalContent, setModalContent] = useState("");

    const [selectedRows, setSelectedRows] = useState([]);
    const [currentRowData, setCurrentRowData] = useState(null);
    const [interfaceNames, setInterfaceNames] = useState([]);
    const [existingMembers, setExistingMembers] = useState([]);

    const instance = interceptor();

    const { setLog } = useLog();
    const { disableConfig, setDisableConfig } = useDisableConfig();

    const selectedDeviceIp = props.selectedDeviceIp;

    useEffect(() => {
        if (props.refresh && Object.keys(changes).length !== 0) {
            setChanges([]);
            getAllPortChanalData();
            getInterfaces();
        }
        props.reset(false);
    }, [props.refresh]);

    useEffect(() => {
        getInterfaces();
        getAllPortChanalData();
    }, [selectedDeviceIp]);

    const getInterfaces = () => {
        instance
            .get(getAllInterfacesOfDeviceURL(selectedDeviceIp))
            .then((res) => {
                const names = res.data.map((item) => item.name);
                setInterfaceNames(names);
            })
            .catch((error) =>
                console.error("Failed to fetch interface names:", error)
            );
    };

    const getAllPortChanalData = () => {
        setDataTable([]);
        setOriginalData([]);
        setChanges([]);

        const apiPUrl = getAllPortChnlsOfDeviceURL(selectedDeviceIp);
        instance
            .get(apiPUrl)
            .then((res) => {
                let data = res.data;

                data &&
                    data.map(
                        (val) => (val["members"] = val["members"].toString())
                    );
                setDataTable(data);
                setOriginalData(JSON.parse(JSON.stringify(data)));
            })
            .catch((err) => {
                console.log(err);
            });
    };

    const defaultColDef = {
        tooltipValueGetter: (params) => {
            return params.value;
        },
        resizable: true,
    };

    const refreshData = () => {
        setDataTable([]);
        const apiPUrl = getAllPortChnlsOfDeviceURL(selectedDeviceIp);
        instance
            .get(apiPUrl)
            .then((res) => {
                setDataTable(res.data);
                setOriginalData(JSON.parse(JSON.stringify(res.data)));
            })
            .catch((err) => {
                setDataTable([]);
                setOriginalData([]);
            })
            .finally(() => {
                setIsModalOpen("null");
            });
    };

    const handleFormSubmit = (formData) => {
        setDisableConfig(true);

        const apiPUrl = getAllPortChnlsOfDeviceURL(selectedDeviceIp);
        instance
            .put(apiPUrl, formData)
            .then((res) => {})
            .catch((err) => {})
            .finally(() => {
                setLog(true);
                setDisableConfig(false);
                refreshData();
            });
    };

    const deletePortchannel = () => {
        const apiPUrl = getAllPortChnlsOfDeviceURL(selectedDeviceIp);
        const deleteData = selectedRows.map((rowData) => ({
            mgt_ip: selectedDeviceIp,
            lag_name: rowData.lag_name,
        }));
        instance
            .delete(apiPUrl, { data: deleteData })
            .then((response) => {
                if (response.data && Array.isArray(response.data.result)) {
                    const updatedDataTable = dataTable.filter(
                        (row) =>
                            !selectedRows.some(
                                (selectedRow) =>
                                    selectedRow.lag_name === row.lag_name
                            )
                    );
                    setDataTable(updatedDataTable);
                }
                setSelectedRows([]);
            })
            .catch((err) => {})
            .finally(() => {
                refreshData();
                setLog(true);
            });
    };

    const onSelectionChanged = () => {
        const selectedNodes = gridRef.current.api.getSelectedNodes();
        const selectedData = selectedNodes.map((node) => node.data);
        setSelectedRows(selectedData);
    };



    const resetConfigStatus = () => {
        setConfigStatus("");
        setChanges([]);

        gridRef.current.api.deselectAll();
        setSelectedRows([]);
    };

    const handleCellValueChanged = useCallback((params) => {
        if (params.newValue !== params.oldValue) {
            if (params.colDef.field === "lag_name") {
                if (!/^PortChannel\d+$/.test(params.newValue)) {
                    alert(
                        'Invalid lag_name format. It should follow the pattern "PortChannel..." where "..." is a numeric value.'
                    );
                    params.node.setDataValue("lag_name", params.oldValue);
                    return;
                }
            }
            setChanges((prev) => {
                if (!Array.isArray(prev)) {
                    console.error("Expected array but got:", prev);
                    return [];
                }
                let latestChanges;
                let isNameExsits = prev.filter(
                    (val) => val.lag_name === params.data.lag_name
                );
                if (isNameExsits.length > 0) {
                    let existedIndex = prev.findIndex(
                        (val) => val.lag_name === params.data.lag_name
                    );
                    prev[existedIndex][params.colDef.field] = params.newValue;
                    latestChanges = [...prev];
                } else {
                    latestChanges = [
                        ...prev,
                        {
                            lag_name: params.data.lag_name,
                            [params.colDef.field]: params.newValue,
                        },
                    ];
                }
                return latestChanges;
            });
        }
    }, []);

    const createJsonOutput = useCallback(() => {
        let output = changes.map((change) => {
            let members = change.members;
            if (
                Array.isArray(members) &&
                members.length > 0 &&
                Array.isArray(members[0])
            ) {
                members = members.flat();
            }

            return {
                mgt_ip: selectedDeviceIp,
                lag_name: change.lag_name,
                ...change,
                members,
            };
        });

        return output;
    }, [selectedDeviceIp, changes]);

    const sendUpdates = useCallback(() => {
        if (changes.length === 0) {
            return;
        }
        setDisableConfig(true);
        setConfigStatus("Config In Progress....");

        const output = createJsonOutput();
        const apiPUrl = getAllPortChnlsOfDeviceURL(selectedDeviceIp);
        instance
            .put(apiPUrl, output)
            .then((res) => {
                resetConfigStatus();
            })
            .catch((err) => {
                resetConfigStatus();
            })
            .finally(() => {
                setDisableConfig(false);
                setLog(true);
                refreshData();
            });
    }, [changes.length, createJsonOutput, selectedDeviceIp, instance]);

    const onCellClicked = useCallback((params) => {
        if (params?.colDef?.field === "members") {
            setCurrentRowData(params?.data);
            setExistingMembers(params?.data?.members);
            setIsModalOpen("addPortchannelMembers");
        }
    }, []);

    const handleMembersSave = (selectedMembers) => {
        setDisableConfig(true);

        const output = {
            mgt_ip: selectedDeviceIp,
            members: selectedMembers,
            lag_name: currentRowData.lag_name,
        };

        const apiPUrl = getAllPortChnlsOfDeviceURL(selectedDeviceIp);

        instance
            .put(apiPUrl, output)
            .then((res) => {
                resetConfigStatus();
            })
            .catch((err) => {
                resetConfigStatus();
            })
            .finally(() => {
                getAllPortChanalData();
                setLog(true);
                setDisableConfig(false);
                setIsModalOpen("null");
            });
    };

    const handelDeleteMemeber = (e) => {
        setDisableConfig(true);

        setIsModalOpen("delete");
        const apiPUrl = getAllPortChnlsOfDeviceURL(selectedDeviceIp);
        const output = {
            mgt_ip: selectedDeviceIp,
            members: e,
            lag_name: currentRowData.lag_name,
        };
        instance
            .delete(apiPUrl, { data: output })
            .then((response) => {
                if (response.data && Array.isArray(response.data.result)) {
                    const updatedDataTable = dataTable.filter(
                        (row) =>
                            !selectedRows.some(
                                (selectedRow) =>
                                    selectedRow.lag_name === row.lag_name
                            )
                    );
                    setDataTable(updatedDataTable);
                }
                setSelectedRows([]);
            })
            .catch((err) => {})
            .finally(() => {
                refreshData();
                setLog(true);
                setDisableConfig(false);
                setIsModalOpen("null");
            });
    };

    const openAddFormModal = () => {
        setIsModalOpen("addPortchannel");
    };

    const handleDelete = () => {
        setIsModalOpen("deletePortChannel");

        let nameArray = [];
        selectedRows.forEach((element) => {
            nameArray.push(element.lag_name + " ");
        });
        setModalContent(
            "Do you want to delete Portchannel with id " + nameArray
        );
    };

    return (
        <div className="datatable-container">
            <div className="datatable">
                <div className="button-group stickyButton">
                    <div className="button-column">
                        <button
                            onClick={sendUpdates}
                            disabled={
                                disableConfig ||
                                Object.keys(changes).length === 0
                            }
                            className="btnStyle"
                        >
                            Apply Config
                        </button>
                        <span className="config-status">{configStatus}</span>
                    </div>

                    <button
                        className="btnStyle"
                        disabled={!getIsStaff()}
                        onClick={openAddFormModal}
                    >
                        Add Port Channel
                    </button>
                    <button
                        className="btnStyle"
                        onClick={handleDelete}
                        disabled={selectedRows.length === 0}
                    >
                        Delete Selected Port Channel
                    </button>
                </div>

                <div style={gridStyle} className="ag-theme-alpine pt-60">
                    <AgGridReact
                        ref={gridRef}
                        rowData={dataTable}
                        columnDefs={portChannelColumns}
                        defaultColDef={defaultColDef}
                        onCellValueChanged={handleCellValueChanged}
                        rowSelection="multiple"
                        checkboxSelection
                        enableCellTextSelection="true"
                        onSelectionChanged={onSelectionChanged}
                        onCellClicked={onCellClicked}
                        stopEditingWhenCellsLoseFocus={true}
                        domLayout={"autoHeight"}
                        suppressRowClickSelection={true}
                    ></AgGridReact>
                </div>

                {/* add port channel */}
                {isModalOpen === "addPortchannel" && (
                    <Modal
                        show={true}
                        onClose={refreshData}
                        title={"Add Port Channel"}
                    >
                        <PortChannelForm
                            onSubmit={handleFormSubmit}
                            selectedDeviceIp={selectedDeviceIp}
                            onCancel={refreshData}
                            handelSubmitButton={disableConfig}
                        />
                    </Modal>
                )}

                {/* member selection */}
                {isModalOpen === "addPortchannelMembers" && (
                    <Modal
                        show={true}
                        onClose={refreshData}
                        title="Select Member Interfaces"
                    >
                        <MembersSelection
                            interfaceNames={interfaceNames}
                            existingMembers={existingMembers}
                            onDeleteMember={handelDeleteMemeber}
                            onSave={(selectedMembers) => {
                                handleMembersSave(selectedMembers);
                            }}
                            onCancel={refreshData}
                        />
                    </Modal>
                )}

                {/* model for delete confirmation message */}
                {isModalOpen === "deletePortChannel" && (
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
                                <button
                                    className="btnStyle"
                                    onClick={deletePortchannel}
                                >
                                    Yes
                                </button>
                                <button
                                    className="btnStyle"
                                    onClick={refreshData}
                                >
                                    No
                                </button>
                            </div>
                        </div>
                    </Modal>
                )}
            </div>
        </div>
    );
};

export default PortChDataTable;
