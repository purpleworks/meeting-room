"use client";
import React, { useState } from "react";
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
import { Layout, Menu, Button } from "antd";
import { Dayjs } from "dayjs";
import { signIn, signOut, useSession } from "next-auth/react";
import { EventClickArg, EventInput } from "@fullcalendar/core/index.js";
import { Session } from "next-auth";
import { TUser } from "./type/user";
import DetailMeetingModal from "./components/modal/DetailMeetingModal";
import ModifyMeetingModal from "./components/modal/ModifyMeetingModal";
import CreateMeetingModal from "./components/modal/CreateMeetingModal";
import resourceTimeGridPlugin from "@fullcalendar/resource-timegrid";

interface IEvent {
  id: number;
  title: string;
  username: string;
  userId: number;
  start: Date | null;
  end: Date | null;
}
interface IDesktopMainContainerProps {
  getTitle: string;
  selectRoomNum: string;
  user: TUser;
  setSelectRoomNum: (num: string) => void;
  colorBgContainer: string;
  refetchData?: EventInput[];
  onClickDate: (arg: DateClickArg) => void;
  onClickEvent: (arg: EventClickArg) => void;
  onChangeEndDate: (value: Dayjs | null, dateString: string) => void;
  onChangeStartDate: (value: Dayjs | null, dateString: string) => void;
  selectTodayRoomNum: string;
  isMutate: () => void;
  selectDate: string;
  createModalOpen: boolean;
  detailModalOpen: boolean;
  modifyModalOpen: boolean;
  dateToTimestamp: (date: Date | string | null) => any;
  selectEventData: IEvent;
  selectDateTime: string[];
  onChangeDetailModal: (open: boolean) => void;
  onChangeModifyModal: (open: boolean) => void;
  onModifyMeetingCancel: () => void;
  onCreateMeetingCancel: () => void;
  setSelectDate: (data: string) => void;
  setSelectDateTime: (data: string[]) => void;
}

const { Header, Sider, Content } = Layout;

const DesktopMainContainer = (props: IDesktopMainContainerProps) => {
  const {
    getTitle,
    selectRoomNum,
    user,
    setSelectRoomNum,
    colorBgContainer,
    refetchData,
    onClickDate,
    onClickEvent,
    onChangeEndDate,
    onChangeStartDate,
    selectTodayRoomNum,
    isMutate,
    selectDate,
    createModalOpen,
    detailModalOpen,
    modifyModalOpen,
    dateToTimestamp,
    selectEventData,
    selectDateTime,
    onChangeDetailModal,
    onChangeModifyModal,
    onModifyMeetingCancel,
    onCreateMeetingCancel,
    setSelectDate,
    setSelectDateTime,
  } = props;
  const { data: session } = useSession();

  const [collapsed, setCollapsed] = useState(false);

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
          <span>{getTitle}</span>
        </Header>
        <Content
          style={{
            margin: "24px 16px",
            padding: 24,
            minHeight: "calc(100vh - 112px)",
            background: colorBgContainer,
          }}
        >
          <Container>
            <ContentWrapper>
              <CalendarWrapper>
                {selectRoomNum === "0" ? (
                  <>
                    <FullCalendar
                      plugins={[resourceTimeGridPlugin, interactionPlugin]}
                      initialView="resourceTimeGridDay"
                      resources={[
                        { id: "1", title: "제 1 회의실" },
                        { id: "2", title: "제 2 회의실" },
                      ]}
                      events={refetchData}
                      allDaySlot={false}
                      headerToolbar={{
                        left: "",
                        center: "title",
                        right: "",
                      }}
                      selectable={true}
                      editable={false}
                      slotMinTime="08:00:00"
                      slotMaxTime="20:00:00"
                      expandRows={true}
                      dateClick={onClickDate}
                      eventClick={onClickEvent}
                      titleFormat={{
                        day: "2-digit",
                        month: "2-digit",
                        year: "numeric",
                      }}
                      locale={"ko"}
                    />
                  </>
                ) : (
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
                    dateClick={onClickDate}
                    eventClick={onClickEvent}
                    titleFormat={{
                      day: "2-digit",
                      month: "2-digit",
                    }}
                    locale={"ko"}
                  />
                )}
                <CreateMeetingModal
                  onChangeEndDate={onChangeEndDate}
                  onChangeStartDate={onChangeStartDate}
                  selectRoomNum={
                    selectRoomNum === "0" ? selectTodayRoomNum : selectRoomNum
                  }
                  mutate={isMutate}
                  modalOpen={createModalOpen}
                  onCreateMeetingCancel={onCreateMeetingCancel}
                  selectDate={selectDate}
                  selectDateTime={selectDateTime}
                  user={user}
                />
                <DetailMeetingModal
                  detailModalOpen={detailModalOpen}
                  mutate={isMutate}
                  onChangeDetailModal={onChangeDetailModal}
                  onChangeModifyModal={onChangeModifyModal}
                  selectDate={selectDate}
                  selectEventData={selectEventData}
                  setSelectDate={(data) => setSelectDate(data)}
                  user={user}
                  dateToTimestamp={dateToTimestamp}
                />
                <ModifyMeetingModal
                  modifyModalOpen={modifyModalOpen}
                  onModifyMeetingCancel={onModifyMeetingCancel}
                  onChangeEndDate={onChangeEndDate}
                  onChangeStartDate={onChangeStartDate}
                  mutate={isMutate}
                  onChangeModifyModal={onChangeModifyModal}
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
};

export default DesktopMainContainer;

function MenuItems({
  selectRoomNum,
  setSelectRoomNum,
  session,
}: {
  selectRoomNum: string;
  setSelectRoomNum: (num: string) => void;
  session: Session | null;
}) {
  return (
    <Menu
      theme="dark"
      mode="inline"
      defaultSelectedKeys={["0"]}
      selectedKeys={[selectRoomNum]}
      items={[
        {
          key: "0",
          icon: <CalendarOutlined />,
          label: "TODAY",
        },
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
