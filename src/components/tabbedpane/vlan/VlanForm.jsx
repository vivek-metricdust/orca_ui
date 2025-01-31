import React, { useEffect, useState, useRef } from "react";
import interceptor from "../../../utils/interceptor";
import useStoreConfig from "../../../utils/configStore";
import { getInterfaceDataCommon } from "../interfaces/interfaceDataTable";
import { getPortChannelDataCommon } from "../portchannel/portChDataTable";
import { getIpAvailableCommon } from "../../../pages/IPAM/IPAM";

const VlanForm = ({ onSubmit, selectedDeviceIp, onClose }) => {
  const instance = interceptor();
  const [selectedInterfaces, setSelectedInterfaces] = useState({});

  const [selectedSagIp, setSelectedSagIp] = useState([]);

  const [interfaceNames, setInterfaceNames] = useState([]);
  // const [disabledIp, setDisabledIp] = useState(false);
  const [disabledSagIp, setDisabledSagIp] = useState(false);

  const setUpdateConfig = useStoreConfig((state) => state.setUpdateConfig);
  const updateConfig = useStoreConfig((state) => state.updateConfig);

  const selectRefVlanMembers = useRef(null);
  const sagIpRef = useRef(null);
  const sagPrefixRef = useRef(null);
  const prefixRef = useRef(null);
  const ipRef = useRef(null);

  const [formData, setFormData] = useState({
    mgt_ip: selectedDeviceIp || "",
    name: "Vlan1",
    vlanid: 1,
    mtu: 9000,
    enabled: false,
    description: undefined,
    ip_address: undefined,
    sag_ip_address: undefined,
    autostate: undefined,
    mem_ifs: undefined,
  });

  const [ipAvailable, setIpAvailable] = useState([]);

  const [ip_prefix, setIp_prefix] = useState(undefined);
  const [sag_prefix, setSag_prefix] = useState(undefined);

  useEffect(() => {
    setInterfaceNames([]);

    getIpAvailableCommon().then((res) => {
      setIpAvailable(res);
    });

    getInterfaceDataCommon(selectedDeviceIp).then((eth_Data) => {
      const ethernetInterfaces = eth_Data
        .filter((element) => element.name.includes("Ethernet"))
        .map((element) => element.name);
      getPortChannelDataCommon(selectedDeviceIp).then((port_data) => {
        const portchannel = port_data.map((element) => element.lag_name);
        setInterfaceNames([...portchannel, ...ethernetInterfaces]);
      });
    });
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === "vlanid") {
      const vlanName = `Vlan${value}`;
      setFormData((prevFormData) => ({
        ...prevFormData,
        vlanid: value,
        name: vlanName,
      }));
    } else if (name === "enabled") {
      setFormData((prevFormData) => ({
        ...prevFormData,
        [name]: value === "true" ? true : false,
      }));
    } else {
      setFormData((prevFormData) => ({
        ...prevFormData,
        [name]: value,
      }));
    }

    if (name === "ip_address" && value) {
      setDisabledSagIp(true);
    } else {
      // setDisabledIp(false);
      setDisabledSagIp(false);
    }
  };

  const handleDropdownChange = (event) => {
    let newValue = event.target.value;

    setSelectedInterfaces((prev) => ({
      ...prev,
      [event.target.value]: "ACCESS",
    }));

    setInterfaceNames((prev) => prev.filter((item) => item !== newValue));
    setTimeout(() => (selectRefVlanMembers.current.value = "DEFAULT"), 100);
  };

  const addSagIp = (event) => {
    if (
      formData.sag_ip_address === "" ||
      formData.sag_ip_address === undefined
    ) {
      alert("SAG IP is required");
      return;
    }
    if (sag_prefix === "" || sag_prefix === undefined) {
      alert("SAG Prefix is required");
      return;
    }
    if (sag_prefix < 1 || sag_prefix > 33) {
      alert("SAG Prefix is not valid");
      return;
    }

    setSelectedSagIp((prev) => [
      ...prev,
      {
        sag_ip_address: formData.sag_ip_address,
        sag_prefix: sag_prefix,
      },
    ]);

    setIpAvailable((prev) =>
      prev.filter((item) => item !== formData.sag_ip_address)
    );

    sagIpRef.current.value = "DEFAULT";
    sagPrefixRef.current.value = undefined;

    setTimeout(() => {
      formData.sag_ip_address = "";
      setSag_prefix(undefined);
    }, 500);
  };

  const handleRemoveSagIp = (index) => {
    setSelectedSagIp((prev) => prev.filter((item, i) => i !== index));
  };

  const handleCheckbox = (key, value) => {
    setSelectedInterfaces((prevInterfaces) => ({
      ...prevInterfaces,
      [key]: value === "TRUNK" ? "ACCESS" : "TRUNK",
    }));
  };

  const handleRemove = (key) => {
    setSelectedInterfaces((prevInterfaces) => {
      const newInterfaces = { ...prevInterfaces };
      delete newInterfaces[key];
      return newInterfaces;
    });

    setInterfaceNames((prev) => {
      const exist = prev.some((item) => item === key);
      if (!exist) {
        return [...prev, key];
      }
      return prev;
    });
  };

  const handelSubmit = (e) => {
    const vlanid = parseFloat(formData.vlanid);
    if (vlanid < 0) {
      alert("VLAN ID cannot be Negative.");
      return;
    }

    if (ip_prefix < 1 || ip_prefix > 33) {
      alert("ip_address is not valid");
      return;
    }

    if (selectedSagIp.length > 0) {
      let ip = selectedSagIp.map(
        (item) => item.sag_ip_address + "/" + item.sag_prefix
      );
      formData.sag_ip_address = ip;
    }

    if (formData.ip_address) {
      formData.ip_address = formData.ip_address + "/" + ip_prefix;
    }

    setIp_prefix(undefined);
    setSag_prefix(undefined);

    if (Object.keys(selectedInterfaces).length > 0) {
      formData.mem_ifs = selectedInterfaces;
    }

    console.log(formData);

    setUpdateConfig(true);
    onSubmit(formData);
  };

  return (
    <div>
      <div className="form-wrapper">
        <div className="form-field w-50">
          <label>Device IP:</label>
          <input type="text" value={selectedDeviceIp} disabled />
        </div>

        <div className="form-field w-50">
          <label>MTU:</label>
          <input
            type="number"
            name="mtu"
            value={formData.mtu}
            onChange={handleChange}
          />
        </div>
      </div>

      <div className="form-wrapper">
        <div className="form-field w-50">
          <label>VLAN_ID:</label>
          <input
            type="number"
            name="vlanid"
            value={formData.vlanid}
            onChange={handleChange}
            min="1"
          />
        </div>

        <div className="form-field w-50">
          <label>Name</label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            disabled
          />
        </div>
      </div>

      <div className="form-wrapper">
        <div className="form-field w-50">
          <label>Autostate </label>
          <select
            name="autostate"
            value={formData.enabled}
            onChange={handleChange}
          >
            <option value="enable">Enable</option>
            <option value="disable">Disable</option>
          </select>
        </div>

        <div className="form-field w-50">
          <label> Admin Status:</label>
          <select
            name="enabled"
            value={formData.enabled}
            onChange={handleChange}
          >
            <option value="true">True</option>
            <option value="false">False</option>
          </select>
        </div>
      </div>

      <div className="form-wrapper">
        <div className="form-field w-40">
          <label> IP address</label>

          <select
            onChange={handleChange}
            defaultValue={"DEFAULT"}
            name="ip_address"
            disabled={selectedSagIp.length > 0}
            ref={ipRef}
          >
            <option value="DEFAULT" disabled>
              Select Ip Address
            </option>
            {ipAvailable.map((ip, index) => (
              <option key={index} value={ip}>
                {ip}
              </option>
            ))}
          </select>
        </div>
        <div className="form-field w-15">
          <label>Prefix</label>
          <input
            type="number"
            min={1}
            max={32}
            id=""
            disabled={selectedSagIp.length > 0}
            onChange={(e) => setIp_prefix(e.target.value)}
            value={ip_prefix}
          />
        </div>
        <div className="form-field w-15">
          <button
            className="btnStyle"
            style={{ marginTop: "22px" }}
            onClick={() => {
              formData.ip_address = "DEFAULT";
              setIp_prefix(undefined);
              ipRef.current.value = "DEFAULT";
              setDisabledSagIp(false);
            }}
          >
            Clear
          </button>
        </div>
      </div>

      <div className="form-wrapper">
        <div className="form-field w-40">
          <label>Anycast Address</label>

          <select
            onChange={handleChange}
            defaultValue={"DEFAULT"}
            name="sag_ip_address"
            ref={sagIpRef}
            disabled={disabledSagIp}
          >
            <option value="DEFAULT" disabled>
              Select Ip Address
            </option>
            {ipAvailable.map((ip, index) => (
              <option key={index} value={ip}>
                {ip}
              </option>
            ))}
          </select>
        </div>

        <div className="form-field w-15">
          <label>Prefix</label>
          <input
            type="number"
            name="sag_prefix"
            onChange={(e) => setSag_prefix(e.target.value)}
            min={1}
            max={32}
            id=""
            ref={sagPrefixRef}
            disabled={disabledSagIp}
          />
        </div>
        <div className="form-field w-25" style={{ marginTop: "25px" }}>
          {selectedSagIp.length} selected
        </div>
        <div className="form-field w-15" style={{ marginTop: "22px" }}>
          <button className="btnStyle" onClick={addSagIp}>
            Add
          </button>
        </div>
      </div>
      <div className="selected-interface-wrap mb-10 w-100">
        {selectedSagIp.map((val, index) => (
          <div key={index} className="selected-interface-list mb-10">
            <div className="ml-10 w-10">{index + 1}</div>

            <div className=" w-50">
              {val.sag_ip_address}/{val.sag_prefix}
            </div>
            <div className=" w-auto">
              <button
                className="btnStyle"
                onClick={() => handleRemoveSagIp(index)}
              >
                Remove
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className="form-wrapper">
        <div className="form-field w-75">
          <label>Select Member Interface </label>
          <select
            onChange={handleDropdownChange}
            ref={selectRefVlanMembers}
            defaultValue={"DEFAULT"}
          >
            <option value="DEFAULT" disabled>
              Select Member Interface
            </option>
            {interfaceNames.map((val, index) => (
              <option key={index} value={val}>
                {val}
              </option>
            ))}
          </select>
        </div>
        <div className="form-field mt-25">
          {Object.keys(selectedInterfaces).length} selected
        </div>
      </div>

      <div className="selected-interface-wrap mb-10 w-100">
        {Object.entries(selectedInterfaces).map(([key, value], index) => (
          <div key={key} className="selected-interface-list mb-10">
            <div className="ml-10 w-50">
              {index + 1} &nbsp; {key}
            </div>
            <div className=" w-50">
              <input
                type="checkbox"
                checked={value === "TRUNK"}
                onChange={() => handleCheckbox(key, value)}
              />
              <span className="ml-10">Tagged</span>

              <button
                className="btnStyle ml-25"
                onClick={() => handleRemove(key)}
              >
                Remove
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className="form-field">
        <label>Description</label>
        <textarea
          type="text"
          name="description"
          value={formData.description}
          onChange={handleChange}
          rows="3"
        ></textarea>
      </div>

      <div className="">
        <button
          type="submit"
          className="btnStyle mr-10"
          disabled={updateConfig}
          onClick={handelSubmit}
        >
          Apply Config
        </button>

        <button type="button" className="btnStyle" onClick={onClose}>
          Cancel
        </button>
      </div>
    </div>
  );
};

export default VlanForm;
