"use client";
import React, { useEffect, useState } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import styled from "styled-components";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
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
import { EventInput } from "@fullcalendar/core/index.js";
import { Session } from "next-auth";
import { TUser } from "./type/user";
import DetailMeetingModal from "./components/modal/DetailMeetingModal";
import ModifyMeetingModal from "./components/modal/ModifyMeetingModal";
import CreateMeetingModal from "./components/modal/CreateMeetingModal";

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
}

const { Header, Sider, Content } = Layout;

export default function Home() {
  const { data: session } = useSession();
  const [user, setUser] = useState<TUser>({
    id: 0,
    name: "",
    login: "",
    company: "",
  });
  const fetcher = (url: any) => fetch(url).then((res) => res.json());
  const moment = require("moment");
  const [collapsed, setCollapsed] = useState(false);
  const [selectRoomNum, setSelectRoomNum] = useState("1");
  const [modalOpen, setModalOpen] = useState(false);
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
  const [meetingsData, setMeetingsData] = useState<IMeeting[]>([]);
  const [refetchData, setRefetchData] = useState<EventInput[]>();
  const { data, error, isLoading, mutate } = useSWR(
    `/api/rest/meetings/${parseInt(selectRoomNum)}`,
    fetcher
  );

  useEffect(() => {
    setMeetingsData(data?.meetings);
  }, [selectRoomNum, data]);

  useEffect(() => {
    const refetch = meetingsData?.map((meeting) => {
      return {
        id: meeting.id.toString(),
        title: meeting.company_name,
        username: meeting.user.name,
        userId: meeting.user.id,
        start: meeting.start_date,
        end: meeting.end_date,
      };
    });
    setRefetchData(refetch);
  }, [meetingsData]);

  const dateToTimestamp = (date: Date | string | null) => {
    return moment(date).format("YYYY-MM-DDTHH:mm:ss+09:00");
  };

  const handleChangeStartDate = (value: Dayjs | null, dateString: string) => {
    const formatStartDate = selectDate + "T" + dateString + ":00+09:00";
    if (formatStartDate >= selectDateTime[1]) {
      let newDate = new Date(formatStartDate);
      newDate.setHours(newDate.getHours() + 1);
      const endDate = dateToTimestamp(newDate);
      setSelectDateTime([formatStartDate, endDate]);
    } else {
      setSelectDateTime([formatStartDate, selectDateTime[1]]);
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
    setModalOpen(false);
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
      if (email.endsWith("@findmodel.co.kr")) {
        return "핌";
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
          axios.post("/api/rest/users", {
            login: session.user?.email,
            company: getCompany(session.user?.email),
            name: session.user?.name,
          });
        });
    }
  }, [session]);

  useEffect(() => {
    setSelectDateTime(selectDateTime);
  }, [selectDateTime, modalOpen, modifyModalOpen, detailModalOpen]);

  if (error) return <div>failed to load</div>;
  if (isLoading) return <div>loading...</div>;

  return (
    <Layout>
      <Sider trigger={null} collapsible collapsed={collapsed}>
        <div className="demo-logo-vertical" />
        <MenuItems
          selectRoomNum={selectRoomNum}
          setSelectRoomNum={setSelectRoomNum}
          session={session}
        />
      </Sider>

      <Layout>
        <Header style={{ padding: 0, background: colorBgContainer }}>
          <Button
            type="text"
            icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
            onClick={() => setCollapsed(!collapsed)}
            style={{
              fontSize: "16px",
              width: 64,
              height: 64,
            }}
          />
          <span>{selectRoomNum === "1" ? "제 1 회의실" : "제 2 회의실"}</span>
        </Header>
        <Content
          style={{
            margin: "24px 16px",
            padding: 24,
            minHeight: 280,
            background: colorBgContainer,
          }}
        >
          <Container>
            <ContentWrapper>
              <CalendarWrapper>
                <FullCalendar
                  plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
                  initialView="timeGridWeek"
                  events={refetchData}
                  allDaySlot={false}
                  headerToolbar={{
                    left: "prev,next today",
                    center: "title",
                    right: "dayGridMonth,timeGridWeek",
                  }}
                  selectable={true}
                  editable={false}
                  slotMinTime="08:00:00"
                  slotMaxTime="20:00:00"
                  expandRows={true}
                  dateClick={(info) => {
                    let newDate = new Date(info.dateStr);
                    newDate.setHours(newDate.getHours() + 1);
                    setModalOpen(true);
                    const date = moment(newDate).format("YYYY-MM-DD");
                    const endDate = dateToTimestamp(newDate);
                    setSelectDate(date);
                    setSelectDateTime([info.dateStr, endDate]);
                  }}
                  eventClick={(info) => {
                    setDetailModalOpen(true);
                    setSelectEventData({
                      id: Number(info.event.id),
                      title: info.event.title,
                      username: info.event.extendedProps.username,
                      userId: info.event.extendedProps.userId,
                      start: info.event.start,
                      end: info.event.end,
                    });
                    setSelectDate(
                      moment(info.event.start).format("YYYY-MM-DD")
                    );
                  }}
                  eventColor="#2C3E50"
                />
                <CreateMeetingModal
                  onChangeEndDate={handleChangeEndDate}
                  onChangeStartDate={handleChangeStartDate}
                  selectRoomNum={selectRoomNum}
                  mutate={mutate}
                  modalOpen={modalOpen}
                  onCreateMeetingCancel={handleCreateMeetingCancel}
                  selectDate={selectDate}
                  selectDateTime={selectDateTime}
                  user={user}
                />
                <DetailMeetingModal
                  detailModalOpen={detailModalOpen}
                  mutate={mutate}
                  onChangeDetailModal={handleChangeDetailModal}
                  onChangeModifyModal={handleChangeModifyModal}
                  selectDate={selectDate}
                  selectEventData={selectEventData}
                  setSelectDate={(data) => setSelectDate(data)}
                  user={user}
                  dateToTimestamp={dateToTimestamp}
                />
                <ModifyMeetingModal
                  modifyModalOpen={modifyModalOpen}
                  onModifyMeetingCancel={handleModifyMeetingCancel}
                  onChangeEndDate={handleChangeEndDate}
                  onChangeStartDate={handleChangeStartDate}
                  mutate={mutate}
                  onChangeModifyModal={handleChangeModifyModal}
                  selectDate={selectDate}
                  selectDateTime={selectDateTime}
                  selectEventData={selectEventData}
                  setSelectDateTime={(data) => setSelectDateTime(data)}
                  dateToTimestamp={dateToTimestamp}
                />
              </CalendarWrapper>
            </ContentWrapper>
          </Container>
        </Content>
      </Layout>
    </Layout>
  );
}

function MenuItems({
  selectRoomNum,
  setSelectRoomNum,
  session,
}: {
  selectRoomNum: string;
  setSelectRoomNum: React.Dispatch<React.SetStateAction<string>>;
  session: Session | null;
}) {
  return (
    <Menu
      theme="dark"
      mode="inline"
      defaultSelectedKeys={["1"]}
      selectedKeys={[selectRoomNum]}
      items={[
        {
          key: "1",
          icon: <CalendarOutlined />,
          label: "제 1 회의실",
        },
        {
          key: "2",
          icon: <CalendarOutlined />,
          label: "제 2 회의실",
        },
        {
          key: "3",
          icon: <UserOutlined />,
          label: session ? "로그아웃" : "로그인",
        },
      ]}
      onClick={(data) =>
        data.key === "3"
          ? session
            ? signOut()
            : signIn()
          : setSelectRoomNum(data.key)
      }
    />
  );
}

const Container = styled.div`
  width: 100%;
  height: 100%;
`;
const ContentWrapper = styled.div`
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: center;
  padding-top: 30px;
`;
const CalendarWrapper = styled.div`
  width: 100%;
  .fc .fc-col-header-cell-cushion,
  .fc-daygrid-day-number,
  .fc-event {
    color: #2c3e50;
  }
  .fc-day-sun a {
    color: red;
  }
  .fc-day-sat a {
    color: blue;
  }
`;
