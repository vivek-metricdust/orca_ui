import React, { useEffect, useMemo, useState, useRef } from "react";
import "./logpane.scss";
import Time from "react-time-format";
import "ag-grid-community/styles/ag-grid.css";
import "ag-grid-community/styles/ag-theme-alpine.css";
import { AgGridReact } from "ag-grid-react";
import interceptor from "../../utils/interceptor";
import { logPanelURL, logPanelDeleteURL } from "../../utils/backend_rest_urls";

import { getIsStaff } from "../../utils/common";
import useStoreLogs from "../../utils/store";
import useStorePointer from "../../utils/pointerStore";
import GenericLogModal from "../../components/modal/genericLogModal";
import SetupLogModal from "../../components/modal/setupLogModal";
import DiscoveryLogModal from "../../components/modal/discoveryLogModal";
import DhcpScanLogModal from "../../components/modal/dhcpScanLogModal";
import { FaRegPlayCircle } from "react-icons/fa";
import { FaRotateLeft } from "react-icons/fa6";
import { FaHourglassHalf } from "react-icons/fa";
import { FaRegCheckCircle } from "react-icons/fa";
import { FaRegCircleXmark } from "react-icons/fa6";
import Modal from "../../components/modal/Modal";

import { getDiscoveryUrl, dhcpScanURL } from "../../utils/backend_rest_urls.js";
import CredentialForm from "../../pages/ZTPnDHCP/CredentialsForm";
import {
  defaultColDef,
  dhcpColumn,
} from "../../components/tabbedpane/datatablesourse";
import secureLocalStorage from "react-secure-storage";

export const getLogsCommon = () => {
  const instance = interceptor();
  const apiUrl = logPanelURL();

  return instance
    .get(apiUrl)
    .then((res) => {
      return res.data;
    })
    .catch((err) => {
      console.error(err);
      return []; // Return an empty array on error
    });
};

export const LogViewer = () => {
  const logPannelDivRef = useRef(null);

  const theme = useMemo(() => {
    if (secureLocalStorage.getItem("theme") === "dark") {
      return "ag-theme-alpine-dark";
    } else {
      return "ag-theme-alpine";
    }
  }, []);

  const [logEntries, setLogEntries] = useState([]);
  const [logEntriesToDelete, setLogEntriesToDelete] = useState({
    log_ids: [],
    task_ids: [],
  });

  const [ongoingProcess, setOngoingProcess] = useState({
    started: 0,
    pending: 0,
  });

  const [hasStartedTask, setHasStartedTask] = useState(false);

  const instance = interceptor();

  const updateLog = useStoreLogs((state) => state.updateLog);
  const resetUpdateLog = useStoreLogs((state) => state.resetUpdateLog);
  const setUpdateLog = useStoreLogs((state) => state.setUpdateLog);

  const setUpdateStorePointer = useStorePointer(
    (state) => state.setUpdateStorePointer
  );

  const [showLogDetails, setShowLogDetails] = useState("null");
  const [logDetails, setLogDetails] = useState({});

  const [colDefs] = useState([
    {
      headerCheckboxSelection: getIsStaff(),
      checkboxSelection: getIsStaff(),
      width: 50,
    },
    {
      field: "index",
      headerName: "#",
      valueGetter: (params) => params.node.rowIndex + 1,
      width: 50,
      resizable: true,
      filter: true,
      filterParams: {
        buttons: ["clear"],
      },
      sortable: true,
    },
    {
      field: "timestamp",
      headerName: "Time",
      width: 170,
      resizable: true,
      filter: true,
      filterParams: {
        buttons: ["clear"],
      },
      sortable: true,
      cellRenderer: (params) => {
        return <Time value={params?.value} format="hh:mm:ss DD-MM-YYYY" />;
      },
      tooltipValueGetter: (params) => {
        return params.value;
      },
    },
    {
      field: "processing_time",
      headerName: "Process Time",
      width: 100,
      resizable: true,
      filter: true,
      filterParams: {
        buttons: ["clear"],
      },
      sortable: true,
      cellRenderer: (params) => {
        let num = params.value;
        num = parseFloat(num);
        num = num.toFixed(2);
        return <span>{num} sec</span>;
      },
      tooltipValueGetter: (params) => {
        return params.value;
      },
    },
    {
      field: "request_json",
      headerName: "Task",
      width: 500,
      resizable: true,
      filter: true,
      filterParams: {
        buttons: ["clear"],
      },
      sortable: true,
      valueGetter: (params) => {
        return (
          params.data.http_method +
          " : " +
          JSON.stringify(params.data.request_json)
        );
      },
      cellRenderer: (params) => {
        return params.value;
      },
      tooltipValueGetter: (params) => {
        return params.value;
      },
    },
    {
      field: "status",
      headerName: "State",
      width: 400,
      resizable: true,
      sortable: true,
      filter: true,
      filterParams: {
        buttons: ["clear"],
      },
      cellRenderer: (params) => {
        if (params.value.toUpperCase() === "SUCCESS") {
          return (
            <div
              className="icon"
              id={params?.data?.status_code}
              state="SUCCESS"
            >
              <FaRegCheckCircle style={{ fontSize: "24px" }} />
            </div>
          );
        } else if (params.value.toUpperCase() === "STARTED") {
          return (
            <div
              className="icon"
              id={params?.data?.status_code}
              state="STARTED"
            >
              <FaRegPlayCircle style={{ fontSize: "24px" }} />
              &nbsp; {params.data.status}
            </div>
          );
        } else if (params.value.toUpperCase() === "PENDING") {
          return (
            <div
              className="icon"
              id={params?.data?.status_code}
              state="PENDING"
            >
              <FaHourglassHalf style={{ fontSize: "24px" }} />
              &nbsp; {params.data.status}
            </div>
          );
        } else if (params.value.toUpperCase() === "REVOKED") {
          return (
            <div
              className="icon"
              id={params?.data?.status_code}
              state="REVOKED"
            >
              <FaRotateLeft style={{ fontSize: "24px" }} />
              &nbsp; {JSON.stringify(params?.data?.response)}
              &nbsp;
            </div>
          );
        } else {
          return (
            <div className="icon" id={params?.data?.status_code} state="FAILED">
              <FaRegCircleXmark style={{ fontSize: "24px" }} />
              &nbsp; {JSON.stringify(params?.data?.response)}
              &nbsp;
            </div>
          );
        }
      },
      cellStyle: (params) => {
        if (params.value.toUpperCase() === "SUCCESS") {
          return { color: "#198754", display: "flex" };
        } else if (params.value.toUpperCase() === "STARTED") {
          return { color: "#FFC107", display: "flex" };
        } else if (params.value.toUpperCase() === "PENDING") {
          return { color: "#6C757D", display: "flex" };
        } else if (params.value.toUpperCase() === "REVOKED") {
          return { color: "#198754", display: "flex" };
        } else {
          return { color: "#DC3545", display: "flex" };
        }
      },
      tooltipValueGetter: (params) => {
        if (params?.data?.response) {
          return JSON.stringify(params?.data?.response);
        } else {
          return params?.data?.status;
        }
      },
    },
  ]);

  const [height, setHeight] = useState(400);

  const [showDhcpTable, setShowDhcpTable] = useState(false);
  const [dhcpTask, setDhcpTask] = useState({
    response: {
      sonic_devices: [],
    },
  });
  const [heightDhcpTable, setHeightDhcpTable] = useState(250);
  const [sshData, setSshData] = useState(false);
  const [selectedRows, setSelectedRows] = useState([]);
  const dhcpTableRef = useRef(null);
  const gridRefDhcpTable = useRef();

  useEffect(() => {
    if (updateLog) {
      getLogs();
    }
  }, [updateLog]);

  useEffect(() => {
    getLogs();
  }, []);

  useEffect(() => {
    setShowDhcpTable(window.location.href.includes("/home"));
  }, [window.location.href]);

  const getLogs = () => {
    setLogEntries([]);
    setDhcpTask({
      response: {
        sonic_devices: [],
      },
    });
    setLogEntriesToDelete({
      log_ids: [],
      task_ids: [],
    });

    getLogsCommon()
      .then((res) => {
        setLogEntries(res);

        let started = 0;
        let pending = 0;
        for (const element of res) {
          if (element.status === "STARTED") {
            started = started + 1;
          } else if (element.status === "PENDING") {
            pending = pending + 1;
          }
        }

        setOngoingProcess({
          started: started,
          pending: pending,
        });

        for (const element of res) {
          if (element.http_path === "/files/dhcp/scan") {
            setDhcpTask(element);
            break;
          } else {
            setDhcpTask({
              response: {
                sonic_devices: [],
              },
            });
          }
        }
      })
      .finally(() => {
        resetUpdateLog();
      });
  };

  const handleResize = () => {
    if (logPannelDivRef.current.offsetHeight > 400) {
      setHeight(logPannelDivRef.current.offsetHeight);
    }
  };

  const gridStyle = useMemo(
    () => ({ height: height - 100 + "px", width: "100%" }),
    [height]
  );

  const openLogDetails = (params) => {
    switch (params.data.http_path) {
      case "/install_image":
        setShowLogDetails("setupDialog");
        break;
      case "/switch_image":
        setShowLogDetails("setupDialog");
        break;
      case "/discover":
        setShowLogDetails("discoveryDialog");
        break;
      case "/files/dhcp/scan":
        setShowLogDetails("dhcpScanDialog");
        break;

      default:
        setShowLogDetails("genericDialog");
        break;
    }

    setLogDetails(params.data);
  };

  const gridRef = useRef(null);

  const clearFilters = () => {
    if (gridRef.current) {
      gridRef.current.api.setFilterModel(null);
    }
  };

  const onSelectionChanged = () => {
    const selectedNodes = gridRef.current.api.getSelectedNodes();
    const selectedId = selectedNodes.map((node) => node.data.id);
    const selectedTask = selectedNodes.map((node) => node.data.task_id);

    const startedTask = selectedNodes.some(
      (node) => node.data.status === "STARTED"
    );

    setHasStartedTask(startedTask);

    setLogEntriesToDelete({
      log_ids: selectedId || [],
      task_ids: selectedTask || [],
    });
  };

  const handelClearLog = () => {
    if (hasStartedTask) {
      setShowLogDetails("deleteDialog");
    } else {
      setShowLogDetails("null");
    }

    instance
      .delete(logPanelDeleteURL(), { data: logEntriesToDelete })
      .then((response) => {
        setUpdateLog(true);
      })
      .catch((error) => {
        console.error("Error:", error);
      })
      .finally(() => {
        getLogs();
        resetUpdateLog();
        setUpdateStorePointer();
        setLogEntriesToDelete({
          log_ids: [],
          task_ids: [],
        });
      });
  };

  const handleResizeDhcpTable = () => {
    if (dhcpTableRef.current.offsetHeight > 250) {
      setHeightDhcpTable(dhcpTableRef.current.offsetHeight);
    }
  };

  const onSelectionChangedDhcp = () => {
    const selectedNodes = gridRefDhcpTable.current.api.getSelectedNodes();
    const selectedData = selectedNodes.map((node) => node.data.device_ip);
    setSelectedRows(selectedData);
  };

  const discoverDhcp = async () => {
    try {
      const response = await instance.put(getDiscoveryUrl(), {
        address: selectedRows,
        discover_from_config: true,
      });
    } catch (error) {
      console.error(error);
    } finally {
    }
  };

  const scanDhcp = () => {
    instance
      .put(dhcpScanURL(), {
        mgt_ip: sshData.device_ip,
      })
      .then((res) => {})
      .catch((err) => {
        console.error(err);
      })
      .finally(() => {
        getLogs();
        setUpdateStorePointer();
      });
  };

  const gridStyleDhcpTable = useMemo(
    () => ({ height: heightDhcpTable + "px", width: "100%" }),
    [heightDhcpTable]
  );

  return (
    <div>
      {showDhcpTable ? (
        <div className="listContainer">
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <span className="listTitle">
              Available SONiC Devices in network
            </span>
            <CredentialForm
              type="status"
              sendCredentialsToParent={(e) => {
                setSshData(e);
              }}
            />

            <div>
              {dhcpTask.timestamp ? (
                <span>
                  Last Scan:
                  <Time
                    className="ml-5 mr-5"
                    value={dhcpTask.timestamp}
                    format="hh:mm:ss DD-MM-YYYY"
                  />
                </span>
              ) : null}

              <button
                className="btnStyle "
                onClick={discoverDhcp}
                disabled={!getIsStaff() || selectedRows.length === 0}
              >
                Discover Device
              </button>
              <button
                className="btnStyle ml-15"
                onClick={() => {
                  scanDhcp();
                }}
                disabled={!getIsStaff()}
              >
                Scan DHCP
              </button>
            </div>
          </div>

          <div
            className="datatable resizable mt-15"
            ref={dhcpTableRef}
            onMouseMove={handleResizeDhcpTable}
          >
            <div style={gridStyleDhcpTable} className={theme}>
              <AgGridReact
                ref={gridRefDhcpTable}
                rowData={dhcpTask?.response?.sonic_devices}
                columnDefs={dhcpColumn}
                defaultColDef={defaultColDef}
                stopEditingWhenCellsLoseFocus={true}
                onSelectionChanged={onSelectionChangedDhcp}
                rowSelection="multiple"
                suppressRowClickSelection={true}
              ></AgGridReact>
            </div>
          </div>
        </div>
      ) : null}

      <div
        className="listContainer logPanel resizable"
        id="logPanel"
        ref={logPannelDivRef}
        onMouseMove={handleResize}
      >
        <div
          className="mb-15"
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <div className="listTitle">Task</div>

          <div>
            <span className="ml-15 ">
              Task Started: {ongoingProcess.started}
            </span>
            <span className="ml-15 ">
              Task Pending: {ongoingProcess.pending}
            </span>
            <button
              id="clearLogBtn"
              className="clearLogBtn btnStyle ml-15"
              onClick={handelClearLog}
              disabled={
                !getIsStaff() ||
                logEntriesToDelete.log_ids.length === 0 ||
                logEntriesToDelete.task_ids.length === 0
              }
            >
              Clear
            </button>
            <button
              className="clearLogBtn btnStyle ml-15"
              onClick={clearFilters}
            >
              Clear All Filters
            </button>
            <button
              id="refreshLogBtn"
              className="clearLogBtn btnStyle ml-15"
              onClick={() => {
                getLogs();
                setUpdateStorePointer();
              }}
              disabled={!getIsStaff()}
            >
              Refresh
            </button>
          </div>
        </div>
        <div style={gridStyle} className={theme}>
          <AgGridReact
            ref={gridRef}
            rowData={logEntries}
            columnDefs={colDefs}
            onRowClicked={(params) => {
              openLogDetails(params);
            }}
            stopEditingWhenCellsLoseFocus={true}
            onSelectionChanged={onSelectionChanged}
            rowSelection="multiple"
            suppressRowClickSelection={true}
            pagination={true}
            paginationPageSize={50}
            paginationPageSizeSelector={[50, 100, 150, 200]}
          />
        </div>

        {showLogDetails === "setupDialog" && (
          <SetupLogModal
            logData={logDetails}
            onClose={() => setShowLogDetails(false)}
            onSubmit={() => setShowLogDetails(false)}
            title="Log Details"
            id="setupLogDetails"
          />
        )}
        {showLogDetails === "genericDialog" && (
          <GenericLogModal
            logData={logDetails}
            onClose={() => setShowLogDetails(false)}
            onSubmit={() => setShowLogDetails(false)}
            title="Log Details"
            id="genericLogDetails"
          />
        )}
        {showLogDetails === "discoveryDialog" && (
          <DiscoveryLogModal
            logData={logDetails}
            onClose={() => setShowLogDetails(false)}
            onSubmit={() => setShowLogDetails(false)}
            title="Log Details"
            id="discoveryLogDetails"
          />
        )}
        {showLogDetails === "dhcpScanDialog" && (
          <DhcpScanLogModal
            logData={logDetails}
            onClose={() => setShowLogDetails(false)}
            onSubmit={() => setShowLogDetails(false)}
            title="Log Details"
            id="discoveryLogDetails"
          />
        )}

        {showLogDetails === "deleteDialog" && (
          <Modal
            show={true}
            onClose={() => setShowLogDetails("null")}
            title=""
            onSubmit={() => setShowLogDetails("null")}
          >
            <div>
              Task which are in Start state can not be cleared. Revoke them and
              try again
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
                  onClick={() => setShowLogDetails("null")}
                >
                  OK
                </button>
              </div>
            </div>
          </Modal>
        )}
      </div>
    </div>
  );
};

export default LogViewer;
