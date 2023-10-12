import React, { useEffect, useRef, useState } from 'react'
import styles from "./ChatSection.module.css"
import axios from "axios"
import io, { Socket } from 'socket.io-client';
import { useSearchParams } from 'react-router-dom';


export let handleGetChats

const ChatSection = () => {

    // refs
    const msgContainer = useRef(null)
    const audioRef = useRef(null)
    const socketRef = useRef();

    // params
    const [searchParams, setSearchParams] = useSearchParams();


    // states
    const [messages, setMessages] = useState([]);
    const [roomInfo, setRoomInfo] = useState({});
    const [newMessage, setNewMessage] = useState('');
    const [scrollBarPosition, setScrollBarPosition] = useState(0);

    // roomid
    const roomId = searchParams.get("id")

    // curruser
    const currUser = JSON.parse(localStorage.getItem("user_data"))


    const handleSendMessage = () => {
        if (newMessage.trim() !== '') {
            // setMessages([...messages, newMessage]);
            setNewMessage('');


            socketRef.current.emit('message', {
                user_id: currUser.id,
                message: newMessage,
                room_id: searchParams.get("id"),
                name: currUser.name
            });



        }



    };

    // handle enter button click to send
    const handleEnter = (e) => {
        if (e.key === "Enter") {
            handleSendMessage()
        }
    }

    // func for slide to bottom
    const handleSlideBottom = () => {
        if (msgContainer.current) {

            msgContainer.current.scrollTop = msgContainer.current.scrollHeight
        }
    }

    useEffect(() => {
        handleSlideBottom()
    }, [roomId]);







    useEffect(() => {


        if (currUser) {
            // call the get chats function initially with id
            handleGetChats(roomId)



            // socket.............................
            socketRef.current = io.connect(`${process.env.REACT_APP_API_KEY}`,
                {
                    query: { name: currUser.name } // Pass user's name as a query parameter
                });

            // Set up Socket.io event handlers
            socketRef.current.on('connect', () => {
                console.log('Socket.io connected.');
            });

            // recieve
            socketRef.current.on('message', (receivedMessage) => {

                setMessages(prev => [...prev, receivedMessage])
                setTimeout(() => {
                    handleSlideBottom()

                    if (currUser.id !== receivedMessage.user_id) {

                        // call notification
                        console.log(audioRef)
                        audioRef.current.play()
                    }
                }, 0);
            });
        }


    }, []);

    // get all chats
    handleGetChats = (id) => {
        if (id) {

            console.log("in handle get chats,")
            // set id in params
            setSearchParams({ id });

            axios.get(`${process.env.REACT_APP_API_KEY}/get_room_info/${id}`)
                .then(res => {
                    setMessages(res.data.room_info.messages)
                    setRoomInfo(res.data.room_info)
                    setTimeout(() => {

                        handleSlideBottom()
                    }, 0);
                })
        }
    }


    // useEffect(() => {
    //     console.log(scrollBarPosition)
    // }, [scrollBarPosition]);



    return (
        <>
            {/* audio message */}
            <audio ref={audioRef} controls  style={{ display: "none" }}>
                <source src="notification/Sneej.mp3" type="audio/mp3" />
                Your browser does not support the audio element.
            </audio>

            <div className={`${styles.chat_app}`} >
                {/* chat group name and info */}
                <nav className="navbar  pe-5 navbar-expand-lg navbar-dark bg-dark" >
                    <div className="container-fluid">
                        <span className="navbar-brand text-uppercase ms-5" style={{letterSpacing: "1px"}}>{roomInfo.room_name}</span>
                        <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarSupportedContent" aria-controls="navbarSupportedContent" aria-expanded="false" aria-label="Toggle navigation">
                            <span className="navbar-toggler-icon"></span>
                        </button>
                        <div className="collapse navbar-collapse" id="navbarSupportedContent">
                            <ul className="navbar-nav ms-auto mb-2 me-5 mb-lg-0">
                              
                                <li className="nav-item dropdown ">
                                    <a className="nav-link dropdown-toggle" href="#" id="navbarDropdown" role="button" data-bs-toggle="dropdown" aria-expanded="false">
                                        Members
                                    </a>
                                    <ul className={`dropdown-menu ${styles.dropDown} bg-dark`} aria-labelledby="navbarDropdown">
                                        {roomInfo.user_info?.map(user=><li key={user.user_id} className="dropdown-item bg-dark text-light" >{user.user_name}</li>)}
                                        
                                     
                                    </ul>
                                </li>
                                
                            </ul>
                           
                        </div>
                    </div>
                </nav>
                <h1 className={styles.bgHeading}>ChatAPP</h1>

                {roomId &&
                    <>

                        <div id='msgContainer' ref={msgContainer} onScroll={(e) => { setScrollBarPosition(e.target.scrollTop) }} className={`${styles.chat_messages} `}>
                            {messages.map((msg) => (
                                // msgRight -> for right message
                                <div key={msg.id} className={`${styles.message} ${currUser.id === msg.user_id ? styles.msgRight : ""}`}>
                                    <strong>{msg.user_name}</strong>
                                    <p>
                                        {msg.message}
                                    </p>
                                </div>
                            ))}



                            {/* go to top butotn */}
                            {/* {msgContainer.current && console.log(scrollBarPosition > msgContainer.current.scrollHeight - msgContainer.current.offsetHeight - 150)} */}

                            {(msgContainer.current && (scrollBarPosition < msgContainer.current.scrollHeight - msgContainer.current.offsetHeight - 150)) &&

                                <div onClick={handleSlideBottom} className={styles.downArrow}>

                                    <span className="material-symbols-outlined">
                                        arrow_downward
                                    </span>
                                </div>
                            }
                        </div>

                        <div className={styles.msgSend_container}>
                            <input type="text" value={newMessage}
                                onKeyDown={(e) => handleEnter(e)}
                                onChange={(e) => setNewMessage(e.target.value)} placeholder='Send a message' />
                            <button onClick={handleSendMessage} style={{
                                backgroundColor: newMessage.length === 0 ? "transparent" : "#19C37D",
                                color: newMessage.length === 0 ? "#6B6C7B" : "whitesmoke",

                            }}>
                                <span className="material-symbols-outlined">
                                    send
                                </span>

                            </button>
                        </div>

                    </>
                }
            </div >


        </>
    )
}

export default ChatSection






