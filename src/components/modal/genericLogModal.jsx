import React, { useEffect, useState } from "react";
import "./logModel.scss";
import Time from "react-time-format";
import { FaSquareXmark } from "react-icons/fa6";
import CommonLogTable from "./commonLogTable";

const GenericLogModal = ({ logData, onClose, onSubmit, title, id }) => {
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        onClose();
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [onClose]);

  return (
    <div className="modalContainer" onClick={onClose} id={id}>
      <div className="modalInner" onClick={(e) => e.stopPropagation()}>
        <h4 className="modalHeader">
          {title}

          <FaSquareXmark
            style={{ fontSize: "30px", cursor: "pointer" }}
            onClick={onClose}
          />
        </h4>

        <div className="modalBody mt-10 mb-10">
          <CommonLogTable
            logData={logData}
            showResponse={true}
          ></CommonLogTable>
        </div>
      </div>
    </div>
  );
};

export default GenericLogModal;
