import React, { useEffect, useState } from "react";
import "ag-grid-community/styles/ag-grid.css";
import "ag-grid-community/styles/ag-theme-alpine.css";
import { FaBookmark } from "react-icons/fa";
import { FaTrashAlt } from "react-icons/fa";
import { FaRegCopy } from "react-icons/fa";

import "./orcAsk.scss";
import {
    bookmarkURL,
    bookmarkDeleteAllURL,
} from "../../utils/backend_rest_urls";
import interceptor from "../../utils/interceptor";

import HistoryChatSection from "./components/historyChatSection";

export const AskOrca = () => {
    const instance = interceptor();

    const [bookmarks, setBookmarks] = useState([]);
    const [copiedBookmark, setCopiedBookmark] = useState("");

    useEffect(() => {
        getBookmark();
    }, []);

    const getBookmark = () => {
        instance
            .get(bookmarkURL())
            .then((response) => {
                console.log(response.data);
                setBookmarks(response.data);
            })
            .catch((error) => {
                console.error("Error ", error);
            });
    };

    const addBookmark = (e) => {
        instance
            .put(bookmarkURL(), e)
            .then((response) => {
                getBookmark();
            })
            .catch((error) => {
                console.error("Error ", error);
            });
    };

    const deleteBookmark = (e) => {
        instance
            .delete(bookmarkURL(), { data: { bookmark_id: e } })
            .then((response) => {
                getBookmark();
            })
            .catch((error) => {
                console.error("Error ", error);
            });
    };

    const deleteAllBookMark = () => {
        instance
            .delete(bookmarkDeleteAllURL())
            .then((response) => {
                getBookmark();
            })
            .catch((error) => {
                console.error("Error ", error);
            });
    };

    const copyBookmark = (e) => {
        setCopiedBookmark(e);
        setTimeout(() => {
            setCopiedBookmark("");
        }, 1000);
    };

    return (
        <div className="flexContainer">
            <div className="leftColumn">
                <HistoryChatSection
                    sendBookmarkDataToParent={addBookmark}
                    copiedBookmark={copiedBookmark}
                />
            </div>
            <div className=" rightColumn">
                <div className="heading">
                    <span className="mr-10">
                        <FaBookmark />
                    </span>
                    Bookmark
                    <span onClick={deleteAllBookMark} className="deleteIcon">
                        <FaTrashAlt />
                    </span>
                </div>

                <div className="tabBody">
                    {bookmarks.map((item, index) => (
                        <div className="bookmarkTitle">
                            <span
                                style={{ cursor: "pointer" }}
                                onClick={() => copyBookmark(item.prompt)}
                            >
                                <FaRegCopy />
                            </span>
                            <div className="ml-10">{item.prompt}</div>
                            <span
                                onClick={() => deleteBookmark(item.bookmark_id)}
                                className="deleteIcon"
                            >
                                <FaTrashAlt />
                            </span>
                        </div>
                    ))}

                    {/* <div className="bookmarkTitle">
                        <FaBookmark />
                        <div className="ml-10">some text which is heading</div>
                    </div>
                    <div className="bookmarkTitle">
                        <FaBookmark />
                        <div className="ml-10">some text which is heading</div>
                    </div> */}
                </div>
            </div>
        </div>
    );
};
export default AskOrca;
