import Router from "next/router";
import { useEffect } from "react";

export default function Custom404() {
  useEffect(() => {
    Router.push("/");
  }, []);
  return <div></div>;
}
