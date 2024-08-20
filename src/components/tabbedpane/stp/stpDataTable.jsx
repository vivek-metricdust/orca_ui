import { useEffect, useState, useRef, useCallback, useMemo } from "react";
import "../tabbedPaneTable.scss";
import { AgGridReact } from "ag-grid-react";
import "ag-grid-community/styles/ag-grid.css";
import "ag-grid-community/styles/ag-theme-alpine.css";
import Modal from "../../modal/Modal";
import { stpColumn } from "../datatablesourse";
import interceptor from "../../../utils/interceptor";
import useStoreConfig from "../../../utils/configStore";
import useStoreLogs from "../../../utils/store";
import { getIsStaff } from "../../../utils/common";
import { stpURL } from "../../../utils/backend_rest_urls";
import StpForm from "./stpForm";
import StpVlanForm from "./stpVlanForm";

export const getStpDataCommon = (selectedDeviceIp) => {
    const instance = interceptor();
    const apiUrl = stpURL(selectedDeviceIp);
    return instance
        .get(apiUrl)
        .then((res) => {
            return res.data;
        })
        .catch((err) => {
            console.log(err);
            return []; // Return an empty array on error
        });
};

export const putStpDataCommon = (selectedDeviceIp, payload, status) => {
    status(true);
    const instance = interceptor();
    const apiUrl = stpURL(selectedDeviceIp);
    return instance
        .put(apiUrl, payload)
        .then((res) => {
            status(false);
            return true;
        })
        .catch((err) => {
            console.log(err);
            status(false);
            return false;
        });
};

export const deleteStpDataCommon = (selectedDeviceIp, payload, status) => {
    status(true);
    const instance = interceptor();
    const apiUrl = stpURL(selectedDeviceIp);
    return instance
        .delete(apiUrl, { data: payload })
        .then((res) => {
            status(false);
            return true;
        })
        .catch((err) => {
            console.log(err);
            status(false);
            return false;
        });
};

const StpDataTable = (props) => {
    const instance = interceptor();

    const gridRef = useRef();
    const gridStyle = useMemo(() => ({ height: "90%", width: "100%" }), []);
    const [dataTable, setDataTable] = useState([]);

    const [configStatus, setConfigStatus] = useState("");
    const [selectedRows, setSelectedRows] = useState([]);
    const [changes, setChanges] = useState({});
    const [isModalOpen, setIsModalOpen] = useState("null");
    const [modalContent, setModalContent] = useState("");
    const setUpdateConfig = useStoreConfig((state) => state.setUpdateConfig);
    const updateConfig = useStoreConfig((state) => state.updateConfig);

    const selectedDeviceIp = props.selectedDeviceIp;
    const setUpdateLog = useStoreLogs((state) => state.setUpdateLog);

    useEffect(() => {
        if (props.refresh && Object.keys(changes).length !== 0) {
            getStp();
        }
        props.reset(false);
    }, [props.refresh]);

    useEffect(() => {
        getStp();
    }, [selectedDeviceIp]);

    const getStp = () => {
        getStpDataCommon(selectedDeviceIp).then((data) => {
            setDataTable(data);
        });
    };

    const resetConfigStatus = () => {
        setConfigStatus("");
    };

    const defaultColDef = {
        tooltipValueGetter: (params) => {
            return params.value;
        },
        resizable: true,
    };

    const onSelectionChanged = () => {
        const selectedNodes = gridRef.current.api.getSelectedNodes();
        const selectedData = selectedNodes.map((node) => node.data);
        setSelectedRows(selectedData);
    };

    const handleCellValueChanged = useCallback((params) => {
        if (params.newValue !== params.oldValue) {
            if (params.colDef.field === "enabled_protocol") {
                setChanges((prev) => ({
                    ...prev,
                    mgt_ip: selectedDeviceIp,
                    [params.colDef.field]: [params.newValue],
                }));
            } else {
                setChanges((prev) => ({
                    ...prev,
                    mgt_ip: selectedDeviceIp,
                    [params.colDef.field]: params.newValue,
                }));
            }
        }
        // setSelectedRows(params.data);
    }, []);

    const onCellClicked = useCallback((params) => {
        if (params?.colDef?.field === "disabled_vlans") {
            setIsModalOpen("addStpVlanForm");
        }

        setSelectedRows(params.data);
    }, []);

    const handleFormSubmit = async (formData) => {
        setConfigStatus("Config In Progress....");
        await putStpDataCommon(selectedDeviceIp, formData, (status) => {
            setUpdateConfig(status);
            setUpdateLog(!status);
            if (!status) {
                refreshData();
            }
        });
    };

    const refreshData = () => {
        setChanges([]);
        setDataTable([]);
        setSelectedRows([]);
        setIsModalOpen("null");
        setConfigStatus("");
        getStp();
    };

    const openAddFormModal = () => {
        setIsModalOpen("addStpForm");
    };

    const deleteStp = async () => {
        let payload = {
            mgt_ip: selectedDeviceIp,
        };

        await deleteStpDataCommon(selectedDeviceIp, payload, (status) => {
            setUpdateConfig(status);
            setUpdateLog(!status);
            if (!status) {
                refreshData();
            }
        });
    };

    return (
        <div className="datatable-container">
            <div className="datatable">
                <div className="button-group stickyButton">
                    <div className="button-column">
                        <button
                            onClick={() => handleFormSubmit(changes)}
                            disabled={updateConfig || changes.length === 0}
                            className="btnStyle"
                        >
                            Apply Config
                        </button>
                        <span className="config-status">{configStatus}</span>
                    </div>

                    <button
                        className="btnStyle"
                        onClick={openAddFormModal}
                        disabled={!getIsStaff()}
                    >
                        Add STP
                    </button>
                    <button
                        className="btnStyle"
                        onClick={deleteStp}
                        disabled={
                            selectedRows.length === 0 ||
                            selectedRows.length === undefined
                        }
                    >
                        Delete selected STP
                    </button>
                </div>

                <div style={gridStyle} className="ag-theme-alpine pt-60">
                    <AgGridReact
                        ref={gridRef}
                        rowData={dataTable}
                        columnDefs={stpColumn}
                        defaultColDef={defaultColDef}
                        onCellValueChanged={handleCellValueChanged}
                        rowSelection="multiple"
                        enableCellTextSelection="true"
                        onSelectionChanged={onSelectionChanged}
                        stopEditingWhenCellsLoseFocus={true}
                        onCellClicked={onCellClicked}
                        domLayout={"autoHeight"}
                        suppressRowClickSelection={true}
                    ></AgGridReact>
                </div>

                {/* model for adding STP */}
                {isModalOpen === "addStpForm" && (
                    <Modal
                        show={true}
                        onClose={refreshData}
                        onSubmit={refreshData}
                        title={"Add STP"}
                    >
                        <StpForm selectedDeviceIp={selectedDeviceIp} />
                    </Modal>
                )}

                {/* model for adding vlans STP */}
                {isModalOpen === "addStpVlanForm" && (
                    <Modal
                        show={true}
                        onClose={refreshData}
                        title={"Add Disabled Vlans for STP"}
                        onSubmit={refreshData}
                    >
                        <StpVlanForm selectedDeviceIp={selectedDeviceIp} />
                    </Modal>
                )}
            </div>
        </div>
    );
};

export default StpDataTable;
