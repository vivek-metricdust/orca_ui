import React, { useState, useEffect } from "react";
import interceptor from "../../../utils/interceptor";
import useStoreConfig from "../../../utils/configStore";

import {
    getAllInterfacesOfDeviceURL,
    deletePortchannelEthernetMemberURL,
} from "../../../utils/backend_rest_urls";

const PortChMemberForm = ({
    onSubmit,
    inputData,
    selectedDeviceIp,
    onCancel,
}) => {
    const [interfaceNames, setInterfaceNames] = useState([]);
    const [selectedInterfaces, setSelectedInterfaces] = useState([]);

    const instance = interceptor();
    const setUpdateConfig = useStoreConfig((state) => state.setUpdateConfig);
    const updateConfig = useStoreConfig((state) => state.updateConfig);

    useEffect(() => {
        getAllInterfaces();

        if (Array.isArray(inputData.members)) {
            setSelectedInterfaces(inputData.members);
        } else {
            setSelectedInterfaces(inputData.members.split(","));
        }
    }, []);

    const getAllInterfaces = () => {
        const apiPUrl = getAllInterfacesOfDeviceURL(selectedDeviceIp);
        instance
            .get(apiPUrl)
            .then((res) => {
                const names = res?.data
                    .map((item) => item?.name)
                    .filter((item) => item?.includes("Ethernet"));
                setInterfaceNames(names);
            })
            .catch((err) => {
                console.log(err);
            });
    };

    const handleDropdownChange = (event) => {
        setSelectedInterfaces((prev) => {
            const newValue = event?.target?.value;
            if (!prev?.includes(newValue)) {
                return [...prev, newValue];
            }
            return prev;
        });
    };

    const handleRemove = (key) => {
        setUpdateConfig(true);
        let selectedMembers = inputData?.members;

        if (selectedMembers?.includes(key)) {
            handelDeleteMemeber(key);
        } else {
            setSelectedInterfaces((prev) => {
                return prev?.filter((item) => item !== key);
            });

            setUpdateConfig(false);
        }
    };

    const handelDeleteMemeber = (e) => {
        setUpdateConfig(true);

        const apiPUrl = deletePortchannelEthernetMemberURL(selectedDeviceIp);
        const output = {
            mgt_ip: selectedDeviceIp,
            members: [e],
            lag_name: inputData.lag_name,
        };
        instance
            .delete(apiPUrl, { data: output })
            .then((response) => {
                setSelectedInterfaces((prev) => {
                    return prev.filter((item) => item !== e);
                });
                onCancel();
            })
            .catch((err) => {})
            .finally(() => {
                setUpdateConfig(false);
            });
    };

    const handleSubmit = (e) => {
        let dataToSubmit = [
            {
                mgt_ip: selectedDeviceIp,
                lag_name: inputData.lag_name,
                members: selectedInterfaces,
            },
        ];

        onSubmit(dataToSubmit);
    };

    return (
        <div>
            <div className="form-wrapper">
                <div className="form-field w-75">
                    <label>Select Member Interface </label>
                    <select
                        onChange={handleDropdownChange}
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
                {Object.entries(selectedInterfaces).map(
                    ([key, value], index) => (
                        <div className="selected-interface-list mb-10">
                            <div key={key} className="ml-10 w-50">
                                {index + 1} &nbsp; {value}
                            </div>
                            <div className=" w-50">
                                <button
                                    className="btnStyle ml-25"
                                    disabled={updateConfig}
                                    onClick={() => handleRemove(value)}
                                >
                                    Remove
                                </button>
                            </div>
                        </div>
                    )
                )}
            </div>

            <div className="">
                <button
                    type="submit"
                    className="btnStyle mr-10"
                    disabled={updateConfig}
                    onClick={handleSubmit}
                >
                    Apply Config
                </button>

                <button type="button" className="btnStyle" onClick={onCancel}>
                    Cancel
                </button>
            </div>
        </div>
    );
};

export default PortChMemberForm;
