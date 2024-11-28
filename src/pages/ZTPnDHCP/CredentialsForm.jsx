import React, { useRef, useEffect, useState } from "react";
import { FaCircle } from "react-icons/fa";
import { dhcpCredentialsURL } from "../../utils/backend_rest_urls";
import interceptor from "../../utils/interceptor";
import Tooltip, { tooltipClasses } from "@mui/material/Tooltip";
import { styled } from "@mui/material/styles";

export const CredentialForm = ({ sendCredentialsToParent }) => {
  const instance = interceptor();
  const [configStatus, setConfigStatus] = useState("");

  const [formData, setFormData] = useState({
    device_ip: "",
    username: "",
    password: "",
    ssh_access: false,
  });

  const CustomToolTip = styled(({ className, ...props }) => (
    <Tooltip {...props} classes={{ popper: className }} />
  ))(({ theme }) => ({
    [`& .${tooltipClasses.tooltip}`]: {
      fontSize: 15,
    },
  }));

  const [isDisabled, setIsDisabled] = useState(false);

  useEffect(() => {
    getCredentials();
  }, []);

  const getCredentials = () => {
    setFormData({
      device_ip: "",
      username: "",
      password: "",
      ssh_access: false,
    });
    setIsDisabled(true);

    instance
      .get(dhcpCredentialsURL())
      .then((res) => {
        setFormData(res.data);
        sendCredentialsToParent(res.data.device_ip);
      })
      .catch((err) => {
        console.log(err);
        setIsDisabled(false);
      })
      .finally(() => {
        setConfigStatus("Config Success");
        setIsDisabled(false);
        setTimeout(() => {
          setConfigStatus("");
        }, 2500);
      });
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevFormData) => ({
      ...prevFormData,
      [name]: value,
    }));
  };

  const putCredentials = (payload) => {
    setIsDisabled(true);
    if (
      payload.device_ip === "" ||
      payload.username === "" ||
      payload.password === ""
    ) {
      alert("Please fill all the fields");
      setIsDisabled(false);
      return;
    }

    setConfigStatus("Config In Progress....");
    instance
      .put(dhcpCredentialsURL(), payload)
      .then((res) => {
        console.log(res.data);
      })
      .catch((err) => {
        console.log(err);
        setConfigStatus("");
        setIsDisabled(false);
      })
      .finally(() => {
        setConfigStatus("");
        getCredentials();
      });
  };

  return (
    <div className="listContainer">
      <div className="form-wrapper" style={{ alignItems: "center" }}>
        <div className="form-field w-25">
          <CustomToolTip
            arrow
            placement="top"
            title="Provide Server IP for SSH connection"
          >
            <label htmlFor=""> Server IP :</label>
          </CustomToolTip>

          <input
            type="text"
            placementholder=""
            onChange={handleChange}
            name="device_ip"
            value={formData.device_ip}
            disabled={isDisabled}
          />
        </div>
        <div className="form-field w-25">
          <CustomToolTip arrow placement="top" title="Provide SSH User Name">
            <label htmlFor=""> SSH User Name :</label>
          </CustomToolTip>

          <input
            type="text"
            placementholder=""
            onChange={handleChange}
            name="username"
            value={formData.username}
            disabled={isDisabled}
          />
        </div>
        <div className="form-field w-25">
          <CustomToolTip arrow placement="top" title="Provide SSH Password">
            <label htmlFor=""> SSH Password :</label>
          </CustomToolTip>
          <input
            type="password"
            placementholder=""
            onChange={handleChange}
            name="password"
            value={formData.password}
            disabled={isDisabled}
            // disabled={formData.ssh_access}
          />
        </div>
        <div className="form-field w-25">
          <span
            style={{
              display: "flex",
              alignItems: "center",
              textAlign: "center",
            }}
          >
            SSH Connection :
            <CustomToolTip
              arrow
              placement="top"
              title={
                formData.ssh_access
                  ? "Connection to SSH is successful"
                  : "Not Connected"
              }
            >
              <div>
                <FaCircle
                  className={`ml-5 ${
                    formData.ssh_access === formData.ssh_access
                      ? "success"
                      : "danger"
                  }`}
                  style={{ fontSize: "25px" }}
                />
              </div>
            </CustomToolTip>
          </span>
        </div>
      </div>

      <div className="form-wrapper" style={{ alignItems: "center" }} >
        <button onClick={() => putCredentials(formData)} className="btnStyle">
          Apply Config
        </button>
        <span className="configStatus">{configStatus}</span>
      </div>
    </div>
  );
};

export default CredentialForm;
