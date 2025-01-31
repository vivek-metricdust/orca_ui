import { useEffect, useState, useRef } from "react";
import Tabs from "@mui/material/Tabs";
import Tab from "@mui/material/Tab";
import Box from "@mui/material/Box";

import Deviceinfo from "../../components/tabbedpane/Deviceinfo";
import InterfaceDataTable from "../../components/tabbedpane/interfaces/interfaceDataTable";
import PortChDataTable from "../../components/tabbedpane/portchannel/portChDataTable";
import McLagDataTable from "../../components/tabbedpane/mclag/mclagDataTable";
import BGPTable from "../../components/tabbedpane/bgp/bgpTable";
import StpDataTable from "./stp/stpDataTable";

import { useParams } from "react-router-dom";
import { getAllDevicesURL } from "../../utils/backend_rest_urls";
import PortGroupTable from "./portgroup/portGroupTable";
import VlanTable from "./vlan/vlanTable";
import "../../pages/home/home.scss";
import { useNavigate } from "react-router-dom";
import secureLocalStorage from "react-secure-storage";
import interceptor from "../../utils/interceptor";
import useStoreLogs from "../../utils/store";

const TabbedPane = () => {
  const instance = interceptor();
  const parentDivRef = useRef(null);

  const { deviceIP } = useParams();
  const [tabvalue, settabvalue] = useState(
    parseInt(secureLocalStorage.getItem("selectedTab")) !== null
      ? parseInt(secureLocalStorage.getItem("selectedTab"))
      : 0
  );
  const [dropdownOptions, setDropdownOptions] = useState([]);
  const [undoChanges, setUndoChanges] = useState(false);

  const setUpdateLog = useStoreLogs((state) => state.setUpdateLog);

  useEffect(() => {
    if (!secureLocalStorage.getItem("selectedTab")) {
      settabvalue(0);
      secureLocalStorage.setItem("selectedTab", tabvalue);
    }

    instance(getAllDevicesURL())
      .then((res) => {
        let data = res.data.map((element) => {
          return { value: element.mgt_ip, label: element.mgt_ip };
        });
        setDropdownOptions(data);
      })
      .catch((err) => console.error(err));
  }, []);

  const handleTabs = (event, val) => {
    settabvalue(val);
    secureLocalStorage.setItem("selectedTab", val);
    setUpdateLog(true);
  };

  const onUndo = (event) => {
    setUndoChanges(true);
  };

  const navigate = useNavigate();

  const handleDeviceChange = (event) => {
    navigate("/devices/" + event.target.value);
    setUndoChanges(true);
  };

  const [height, setHeight] = useState(500);
  const handleResize = () => {
    if (parentDivRef.current) {
      setHeight(parentDivRef.current.offsetHeight);
    }
  };

  useEffect(() => {
    if (parentDivRef.current && tabvalue === 0) {
      parentDivRef.current.style.height = `${450}px`;
    } else if (parentDivRef.current && (tabvalue === 1 || tabvalue === 5)) {
      parentDivRef.current.style.height = `${500}px`;
    } else if (parentDivRef.current) {
      parentDivRef.current.style.height = `${300}px`;
    }
  }, [tabvalue]);

  return (
    <div>
      <div className="listContainer">
        Device :
        <select
          className="ml-10"
          value={deviceIP}
          onChange={handleDeviceChange}
        >
          {dropdownOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.value}
            </option>
          ))}
        </select>
        <button type="button" className="btnColor ml-10" onClick={onUndo}>
          Undo Changes
        </button>
      </div>
      <div className="listContainer" id="tabbedPane">
        <Box
          sx={{
            borderBottom: 1,
            borderColor: "divider",
          }}
        >
          <Tabs
            value={tabvalue}
            onChange={handleTabs}
            variant="scrollable"
            scrollButtons="auto"
          >
            <Tab className="tabStyle" label="Device Info" />
            <Tab className="tabStyle" label="Interfaces" />
            <Tab className="tabStyle" label="PortChannels" />
            <Tab className="tabStyle" label="MCLAGs" />
            <Tab className="tabStyle" label="BGP" />
            <Tab className="tabStyle" label="Port Groups" />
            <Tab className="tabStyle" label="VLANs" />
            <Tab className="tabStyle" label="STP" />
          </Tabs>
        </Box>
        {tabvalue === 0 && (
          <div
            className="resizable"
            onMouseMove={handleResize}
            ref={parentDivRef}
            tabvalue={tabvalue}
            index={0}
          >
            <Deviceinfo
              refresh={undoChanges}
              selectedDeviceIp={deviceIP}
              height={height}
              reset={() => setUndoChanges(false)}
              //   orcaState={orcaState}
            />
          </div>
        )}
        {tabvalue === 1 && (
          <div
            className="resizable"
            onMouseMove={handleResize}
            ref={parentDivRef}
            tabvalue={tabvalue}
            index={1}
          >
            <InterfaceDataTable
              selectedDeviceIp={deviceIP}
              refresh={undoChanges}
              height={height}
              reset={() => setUndoChanges(false)}
            />
          </div>
        )}
        {tabvalue === 2 && (
          <div
            className="resizable"
            onMouseMove={handleResize}
            ref={parentDivRef}
            tabvalue={tabvalue}
            index={2}
          >
            <PortChDataTable
              selectedDeviceIp={deviceIP}
              refresh={undoChanges}
              height={height}
              reset={() => setUndoChanges(false)}
            />
          </div>
        )}
        {tabvalue === 3 && (
          <div
            className="resizable"
            onMouseMove={handleResize}
            ref={parentDivRef}
            tabvalue={tabvalue}
            index={3}
          >
            <McLagDataTable
              selectedDeviceIp={deviceIP}
              refresh={undoChanges}
              height={height}
              reset={() => setUndoChanges(false)}
            />
          </div>
        )}
        {tabvalue === 4 && (
          <div
            className="resizable"
            onMouseMove={handleResize}
            ref={parentDivRef}
            tabvalue={tabvalue}
            index={4}
          >
            <BGPTable
              selectedDeviceIp={deviceIP}
              refresh={undoChanges}
              height={height}
              reset={() => setUndoChanges(false)}
            />
          </div>
        )}
        {tabvalue === 5 && (
          <div
            className="resizable"
            onMouseMove={handleResize}
            ref={parentDivRef}
            tabvalue={tabvalue}
            index={5}
          >
            <PortGroupTable
              selectedDeviceIp={deviceIP}
              refresh={undoChanges}
              height={height}
              reset={() => setUndoChanges(false)}
            />
          </div>
        )}
        {tabvalue === 6 && (
          <div
            className="resizable"
            onMouseMove={handleResize}
            ref={parentDivRef}
            tabvalue={tabvalue}
            index={6}
          >
            <VlanTable
              selectedDeviceIp={deviceIP}
              refresh={undoChanges}
              height={height}
              reset={() => setUndoChanges(false)}
            />
          </div>
        )}
        {tabvalue === 7 && (
          <div
            className="resizable"
            onMouseMove={handleResize}
            ref={parentDivRef}
            tabvalue={tabvalue}
            index={6}
          >
            <StpDataTable
              selectedDeviceIp={deviceIP}
              refresh={undoChanges}
              height={height}
              reset={() => setUndoChanges(false)}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default TabbedPane;
