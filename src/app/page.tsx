import { Button, Typography } from "@mui/material";
import Image from "next/image";
import AdminLayout from "./layout/adminLayout";
import Dashboard from "./dashboard/page";
import Login from "./auth/login/page";

export default function Home() {
  return (
    <Login />
  );
}
