"use client";
import React, { useEffect, useState } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import styled from "styled-components";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin, { DateClickArg } from "@fullcalendar/interaction";
import {
  CalendarOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  UserOutlined,
} from "@ant-design/icons";
import { Layout, Menu, Button, theme } from "antd";
import { Dayjs } from "dayjs";
import axios from "axios";
import useSWR from "swr";
import { signIn, signOut, useSession } from "next-auth/react";
import { EventClickArg, EventInput } from "@fullcalendar/core/index.js";
import { Session } from "next-auth";
import { TUser } from "./type/user";
import DetailMeetingModal from "./components/modal/DetailMeetingModal";
import ModifyMeetingModal from "./components/modal/ModifyMeetingModal";
import CreateMeetingModal from "./components/modal/CreateMeetingModal";
import resourceTimeGridPlugin from "@fullcalendar/resource-timegrid";
import DesktopMainContainer from "./desktop-main-container";
import MobileMainContainer from "./mobile-main-container";
import { NotLogin } from "./components/modal/WarningModal";

interface IEvent {
  id: number;
  title: string;
  username: string;
  userId: number;
  start: Date | null;
  end: Date | null;
}
interface IMeeting {
  id: number;
  company_name: string;
  room_id: number;
  user: {
    id: number;
    name: string;
  };
  start_date: Date;
  end_date: Date;
  resourceId?: number;
}

export default function Home() {
  const { data: session } = useSession();
  const [user, setUser] = useState<TUser>({
    id: 0,
    name: "",
    login: "",
    company: "",
  });
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const isMobile =
      /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
        navigator.userAgent
      );
    setIsMobile(isMobile);
    setSelectRoomNum(isMobile ? "1" : "0");
  }, [isMobile]);
  const fetcher = (url: any) => fetch(url).then((res) => res.json());
  const moment = require("moment");
  const [selectRoomNum, setSelectRoomNum] = useState(isMobile ? "1" : "0");
  const [selectTodayRoomNum, setSelectTodayRoomNum] = useState("0");
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [modifyModalOpen, setModifylModalOpen] = useState(false);
  const [selectDateTime, setSelectDateTime] = useState(["", ""]);
  const [selectDate, setSelectDate] = useState("");
  const [selectEventData, setSelectEventData] = useState<IEvent>({
    id: 0,
    title: "",
    username: "",
    userId: 0,
    start: null,
    end: null,
  });
  const [todayMeetingsData, setTodayMeetingsData] = useState<IMeeting[]>([]);
  const [meetingsData, setMeetingsData] = useState<IMeeting[]>([]);
  const [refetchData, setRefetchData] = useState<EventInput[]>();
  const {
    data: allMeetings,
    error: allMeetingError,
    isLoading: allMeetingIsLoading,
    mutate: allMeetingMutate,
  } = useSWR(`/api/rest/meetings`, fetcher);
  const { data, error, isLoading, mutate } = useSWR(
    `/api/rest/meetings/${parseInt(selectRoomNum)}`,
    fetcher
  );
  const getEventColor = (company: string) => {
    if (company === "퍼플웍스") {
      return "#7B25F9";
    } else if (company === "요일") {
      return "#DB598F";
    } else if (company === "핌") {
      return "#65B89D";
    } else {
      return "#2C3E50";
    }
  };
  const getTitle = (selectRoom: string) => {
    switch (selectRoom) {
      case "0":
        return "TODAY";
        break;
      case "1":
        return "제 1 회의실";
        break;
      case "2":
        return "제 2 회의실";
        break;
      default:
        return "";
    }
  };
  const isMutate = () => {
    allMeetingMutate();
    mutate();
  };

  useEffect(() => {
    setMeetingsData(data?.meetings);
    setTodayMeetingsData(allMeetings?.meetings);
  }, [selectRoomNum, data, allMeetings]);

  useEffect(() => {
    const refetch =
      selectRoomNum === "0"
        ? todayMeetingsData?.map((meeting) => {
            return {
              id: meeting.id.toString(),
              title: meeting.company_name,
              username: meeting.user.name,
              userId: meeting.user.id,
              start: meeting.start_date,
              end: meeting.end_date,
              color: getEventColor(meeting.company_name),
              resourceId: meeting.room_id,
            };
          })
        : meetingsData?.map((meeting) => {
            return {
              id: meeting.id.toString(),
              title: meeting.company_name,
              username: meeting.user.name,
              userId: meeting.user.id,
              start: meeting.start_date,
              end: meeting.end_date,
              color: getEventColor(meeting.company_name),
            };
          });
    setRefetchData(refetch);
  }, [meetingsData, todayMeetingsData]);

  const dateToTimestamp = (date: Date | string | null) => {
    return moment(date).format("YYYY-MM-DDTHH:mm:ss+09:00");
  };

  const handleClickDate = (arg: DateClickArg) => {
    console.log("arg", arg);
    let newDate = new Date(arg.dateStr);
    newDate.setHours(newDate.getHours() + 1);
    setCreateModalOpen(true);
    const date = moment(newDate).format("YYYY-MM-DD");
    const endDate = dateToTimestamp(newDate);
    setSelectDate(date);
    setSelectDateTime([arg.dateStr, endDate]);
    setSelectTodayRoomNum(arg.resource?._resource.id ?? "0");
  };

  const handleClickEvent = (arg: EventClickArg) => {
    setDetailModalOpen(true);
    setSelectEventData({
      id: Number(arg.event.id),
      title: arg.event.title,
      username: arg.event.extendedProps.username,
      userId: arg.event.extendedProps.userId,
      start: arg.event.start,
      end: arg.event.end,
    });
    setSelectDate(moment(arg.event.start).format("YYYY-MM-DD"));
  };

  const handleChangeStartDate = (value: Dayjs | null, dateString: string) => {
    console.log("dateString", dateString);
    const formatStartDate = selectDate + "T" + dateString + ":00+09:00";
    if (formatStartDate >= selectDateTime[1]) {
      let newDate = new Date(formatStartDate);
      newDate.setHours(newDate.getHours() + 1);
      const endDate = dateToTimestamp(newDate);
      setSelectDateTime([formatStartDate, endDate]);
      console.log("1", [formatStartDate, endDate]);
    } else {
      setSelectDateTime([formatStartDate, selectDateTime[1]]);
      console.log("2", [formatStartDate, selectDateTime[1]]);
    }
  };
  const handleChangeEndDate = (value: Dayjs | null, dateString: string) => {
    const formatEndDate = selectDate + "T" + dateString + ":00+09:00";
    if (selectDateTime[0] >= formatEndDate) {
      let newDate = new Date(formatEndDate);
      newDate.setHours(newDate.getHours() - 1);
      const startDate = dateToTimestamp(newDate);
      setSelectDateTime([startDate, formatEndDate]);
    } else {
      setSelectDateTime([selectDateTime[0], formatEndDate]);
    }
  };

  const handleCreateMeetingCancel = () => {
    setSelectDateTime(["", ""]);
    setCreateModalOpen(false);
  };

  const handleModifyMeetingCancel = () => {
    setModifylModalOpen(false);
    setSelectDate("");
    setSelectDateTime(["", ""]);
  };

  const handleChangeDetailModal = (open: boolean) => {
    setDetailModalOpen(open);
  };
  const handleChangeModifyModal = (open: boolean) => {
    setModifylModalOpen(open);
  };
  const getCompany = (email?: string | null) => {
    if (email) {
      if (email.endsWith("@purpleworks.co.kr")) {
        return "퍼플웍스";
      }
      if (email.endsWith("@yoil.co.kr")) {
        return "요일";
      }
    }
    return "";
  };

  const {
    token: { colorBgContainer },
  } = theme.useToken();

  useEffect(() => {
    if (session) {
      axios
        .get(`/api/rest/user/${session.user?.email}`)
        .then((res) => {
          const newUser = res.data.users[0];
          setUser({
            id: newUser.id,
            company: newUser.company,
            login: newUser.login,
            name: newUser.name,
          });
        })
        .catch(() => {
          if (getCompany(session.user?.email) !== "") {
            axios.post("/api/rest/users", {
              login: session.user?.email,
              company: getCompany(session.user?.email),
              name: session.user?.name,
            });
          } else {
            NotLogin();
          }
        });
    }
  }, [session]);

  useEffect(() => {
    setSelectDateTime(selectDateTime);
  }, [selectDateTime, createModalOpen, modifyModalOpen, detailModalOpen]);

  if (error) return <div>failed to load</div>;
  if (isLoading) return <div>loading...</div>;

  return (
    <Layout>
      {isMobile ? (
        <MobileMainContainer
          getTitle={getTitle(selectRoomNum)}
          selectRoomNum={selectRoomNum}
          user={user}
          setSelectRoomNum={(num: string) => setSelectRoomNum(num)}
          colorBgContainer={colorBgContainer}
          refetchData={refetchData}
          onClickDate={handleClickDate}
          onClickEvent={handleClickEvent}
          onChangeEndDate={handleChangeEndDate}
          onChangeStartDate={handleChangeStartDate}
          selectTodayRoomNum={selectTodayRoomNum}
          isMutate={isMutate}
          selectDate={selectDate}
          createModalOpen={createModalOpen}
          detailModalOpen={detailModalOpen}
          modifyModalOpen={modifyModalOpen}
          dateToTimestamp={dateToTimestamp}
          selectEventData={selectEventData}
          selectDateTime={selectDateTime}
          onChangeDetailModal={handleChangeDetailModal}
          onChangeModifyModal={handleChangeModifyModal}
          onCreateMeetingCancel={handleCreateMeetingCancel}
          onModifyMeetingCancel={handleModifyMeetingCancel}
          setSelectDate={(data) => setSelectDate(data)}
          setSelectDateTime={(data) => setSelectDateTime(data)}
        />
      ) : (
        <DesktopMainContainer
          getTitle={getTitle(selectRoomNum)}
          selectRoomNum={selectRoomNum}
          user={user}
          setSelectRoomNum={(num: string) => setSelectRoomNum(num)}
          colorBgContainer={colorBgContainer}
          refetchData={refetchData}
          onClickDate={handleClickDate}
          onClickEvent={handleClickEvent}
          onChangeEndDate={handleChangeEndDate}
          onChangeStartDate={handleChangeStartDate}
          selectTodayRoomNum={selectTodayRoomNum}
          isMutate={isMutate}
          selectDate={selectDate}
          createModalOpen={createModalOpen}
          detailModalOpen={detailModalOpen}
          modifyModalOpen={modifyModalOpen}
          dateToTimestamp={dateToTimestamp}
          selectEventData={selectEventData}
          selectDateTime={selectDateTime}
          onChangeDetailModal={handleChangeDetailModal}
          onChangeModifyModal={handleChangeModifyModal}
          onCreateMeetingCancel={handleCreateMeetingCancel}
          onModifyMeetingCancel={handleModifyMeetingCancel}
          setSelectDate={(data) => setSelectDate(data)}
          setSelectDateTime={(data) => setSelectDateTime(data)}
        />
      )}
    </Layout>
  );
}
