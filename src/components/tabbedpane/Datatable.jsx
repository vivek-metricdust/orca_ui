import { useEffect, useState, useRef, useCallback, useMemo } from "react";
import "./tabbedPaneTable.scss";
import { deviceUserColumns, defaultColDef } from "./datatablesourse";
import { AgGridReact } from "ag-grid-react";
import "ag-grid-community/styles/ag-grid.css";
import "ag-grid-community/styles/ag-theme-alpine.css";
import { getAllDevicesURL } from "../../utils/backend_rest_urls.js";
import Modal from "../modal/Modal";

import interceptor from "../../utils/interceptor";

import { deleteDevicesURL } from "../../utils/backend_rest_urls.js";

import { useLog } from "../../utils/logpannelContext";
import { useDisableConfig } from "../../utils/dissableConfigContext.js";

const Datatable = (props) => {
    const instance = interceptor();

    const { setLog } = useLog();
    const { disableConfig, setDisableConfig } = useDisableConfig();

    const gridRef = useRef();
    const gridStyle = useMemo(() => ({ height: "100%", width: "100%" }), []);
    const {
        rows,
        columns,
        isTabbedPane = false,
        selectedDeviceIp = "",
    } = props;

    const [dataTable, setDataTable] = useState([]);
    const [selectedDeviceToDelete, setSelectedDeviceToDelete] = useState("");

    useEffect(() => {
        getDevices();
    }, [isTabbedPane]);

    const getDevices = () => {
        setDataTable([]);
        instance(getAllDevicesURL())
            .then((res) => {
                if (isTabbedPane) {
                    let data = res.data.filter(
                        (item) => item.mgt_ip === selectedDeviceIp
                    );
                    setDataTable(data);
                } else {
                    setDataTable(res.data);
                }
            })
            .catch((err) => console.log(err));
    };

    const onColumnResized = useCallback((params) => {}, []);

    const onCellClicked = useCallback((params) => {
        if (params.event.target.tagName === "BUTTON") {
            console.log("onCellClicked", params.data.mgt_ip);
            setSelectedDeviceToDelete(params.data.mgt_ip);
        }
    }, []);

    const handleDeleteCancellation = () => {
        setSelectedDeviceToDelete("");
    };

    const handleDeleteConfirmation = () => {
        console.log("Delete");
        setDisableConfig(true);
        const apiPUrl = deleteDevicesURL();
        instance
            .delete(apiPUrl, { data: { mgt_ip: selectedDeviceToDelete } })
            .then((res) => {
                console.log(res);
            })
            .catch((err) => {})
            .finally(() => {
                setDisableConfig(false);
                setSelectedDeviceToDelete("");
                getDevices();
            });
    };

    return (
        <div className="datatable">
            <div style={gridStyle} className="ag-theme-alpine">
                <AgGridReact
                    ref={gridRef}
                    rowData={dataTable}
                    columnDefs={deviceUserColumns(isTabbedPane)}
                    defaultColDef={defaultColDef}
                    onColumnResized={onColumnResized}
                    enableCellTextSelection="true"
                    onCellClicked={onCellClicked}
                    domLayout={"autoHeight"}
                ></AgGridReact>
            </div>

            {selectedDeviceToDelete && (
                <Modal
                    show={selectedDeviceToDelete}
                    onClose={handleDeleteCancellation}
                >
                    <div>
                        <p className="mb-10">
                            Device {selectedDeviceToDelete}, its components and
                            links will be removed
                        </p>
                        <button
                            className="btnStyle mt-10 mr-10"
                            onClick={handleDeleteConfirmation}
                        >
                            Yes
                        </button>
                        <button
                            className="btnStyle mt-10"
                            onClick={handleDeleteCancellation}
                        >
                            No
                        </button>
                    </div>
                </Modal>
            )}
        </div>
    );
};

export default Datatable;
