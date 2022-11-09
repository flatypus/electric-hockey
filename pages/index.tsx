import Head from "next/head";
import Router from "next/router";
import React, { useEffect, useState } from "react";
import Canvas from "../components/canvas";

function Home() {
  const [joinCode, setJoinCode] = useState("");
  return (
    <div className="w-full h-full grid place-items-center">
      <div className="flex flex-row gap-x-4 m-20">
        <input
          placeholder="Enter Join Code"
          onChange={(e) => setJoinCode(e.target.value)}
          className="outline-none p-2 rounded-full"
        ></input>
        <button
          className="p-2 rounded-full bg-[#3f3f3f]"
          onClick={() => Router.push(`/${joinCode}`)}
        >
          Join
        </button>
      </div>
    </div>
  );
}

export default Home;
