import React from "react";
import { NavBar, TabBar } from "antd-mobile";
import {
  Route,
  Routes,
  useNavigate,
  useLocation,
  MemoryRouter as Router,
} from "react-router-dom";
import { CalendarOutline, UserOutline } from "antd-mobile-icons";
import { styled } from "styled-components";
import MobileCalendar from "./components/calendar/mobile/MobileCalendar";
import { signIn, signOut, useSession } from "next-auth/react";
import { TUser } from "./type/user";
import { EventClickArg, EventInput } from "@fullcalendar/core";
import { DateClickArg } from "@fullcalendar/interaction/index.js";
import { Dayjs } from "dayjs";

interface IEvent {
  id: number;
  title: string;
  username: string;
  userId: number;
  start: Date | null;
  end: Date | null;
}
interface IMobileMainContainerProps {
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
interface IBottomProps {
  setSelectRoomNum: (num: string) => void;
}

const Bottom = (props: IBottomProps) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { pathname } = location;
  const { data: session } = useSession();

  const setRouteActive = (value: string) => {
    navigate(value);
  };

  const tabs = [
    {
      key: "/room-1",
      room: "1",
      title: "제 1 회의실",
      icon: <CalendarOutline />,
    },
    {
      key: "/room-2",
      room: "2",
      title: "제 2 회의실",
      icon: <CalendarOutline />,
    },
    {
      key: "/login",
      room: "",
      title: session ? "로그아웃" : "로그인",
      icon: <UserOutline />,
    },
  ];

  return (
    <TabBar
      activeKey={pathname}
      onChange={(value) => {
        setRouteActive(value);
        props.setSelectRoomNum(value.slice(6));
        if (value.slice(6) === "") {
          session ? signOut() : signIn();
        }
      }}
    >
      {tabs.map((item) => (
        <TabBar.Item key={item.key} icon={item.icon} title={item.title} />
      ))}
    </TabBar>
  );
};

const MobileMainContainer = (props: IMobileMainContainerProps) => {
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
  return (
    <Router initialEntries={["/room-1"]}>
      <Container>
        <TopWrapper>
          <NavBar>
            {selectRoomNum === "1" ? "제 1 회의실" : "제 2 회의실"}
          </NavBar>
        </TopWrapper>
        <BodyWrapper>
          <Routes>
            <Route
              path="/room-1"
              element={
                <MobileCalendar
                  getTitle={getTitle}
                  selectRoomNum={selectRoomNum}
                  user={user}
                  setSelectRoomNum={setSelectRoomNum}
                  colorBgContainer={colorBgContainer}
                  refetchData={refetchData}
                  onClickDate={onClickDate}
                  onClickEvent={onClickEvent}
                  onChangeEndDate={onChangeEndDate}
                  onChangeStartDate={onChangeStartDate}
                  selectTodayRoomNum={selectTodayRoomNum}
                  isMutate={isMutate}
                  selectDate={selectDate}
                  createModalOpen={createModalOpen}
                  detailModalOpen={detailModalOpen}
                  modifyModalOpen={modifyModalOpen}
                  dateToTimestamp={dateToTimestamp}
                  selectEventData={selectEventData}
                  selectDateTime={selectDateTime}
                  onChangeDetailModal={onChangeDetailModal}
                  onChangeModifyModal={onChangeModifyModal}
                  onCreateMeetingCancel={onCreateMeetingCancel}
                  onModifyMeetingCancel={onModifyMeetingCancel}
                  setSelectDate={setSelectDate}
                  setSelectDateTime={setSelectDateTime}
                />
              }
            >
              제 1 회의실
            </Route>
            <Route
              path="/room-2"
              element={
                <MobileCalendar
                  getTitle={getTitle}
                  selectRoomNum={selectRoomNum}
                  user={user}
                  setSelectRoomNum={setSelectRoomNum}
                  colorBgContainer={colorBgContainer}
                  refetchData={refetchData}
                  onClickDate={onClickDate}
                  onClickEvent={onClickEvent}
                  onChangeEndDate={onChangeEndDate}
                  onChangeStartDate={onChangeStartDate}
                  selectTodayRoomNum={selectTodayRoomNum}
                  isMutate={isMutate}
                  selectDate={selectDate}
                  createModalOpen={createModalOpen}
                  detailModalOpen={detailModalOpen}
                  modifyModalOpen={modifyModalOpen}
                  dateToTimestamp={dateToTimestamp}
                  selectEventData={selectEventData}
                  selectDateTime={selectDateTime}
                  onChangeDetailModal={onChangeDetailModal}
                  onChangeModifyModal={onChangeModifyModal}
                  onCreateMeetingCancel={onCreateMeetingCancel}
                  onModifyMeetingCancel={onModifyMeetingCancel}
                  setSelectDate={setSelectDate}
                  setSelectDateTime={setSelectDateTime}
                />
              }
            >
              제 2 회의실
            </Route>
          </Routes>
        </BodyWrapper>
        <BottomWrapper>
          <Bottom setSelectRoomNum={(num: string) => setSelectRoomNum(num)} />
        </BottomWrapper>
      </Container>
    </Router>
  );
};

export default MobileMainContainer;

const Container = styled.div`
  height: 100vh;
  display: flex;
  flex-direction: column;
`;
const TopWrapper = styled.div`
  flex: 0;
  border-bottom: solid 1px var(--adm-color-border);
`;
const BodyWrapper = styled.div`
  flex: 1;
  display: flex;
  justify-content: center;
  align-items: center;
  margin: 20px 0;
`;
const BottomWrapper = styled.div`
  flex: 0;
  border-top: solid 1px var(--adm-color-border);
`;
