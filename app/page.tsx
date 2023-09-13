"use client";
import React, { useEffect, useState } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import styled from "styled-components";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import {
  ArrowRightOutlined,
  CalendarOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
} from "@ant-design/icons";
import {
  Layout,
  Menu,
  Button,
  theme,
  Modal,
  Input,
  DatePicker,
  TimePicker,
} from "antd";
import type { DatePickerProps, RangePickerProps } from "antd/es/date-picker";
import dayjs, { Dayjs } from "dayjs";
import axios from "axios";
import useSWR from "swr";
import { signIn, signOut, useSession } from "next-auth/react";
import { EventInput } from "@fullcalendar/core/index.js";

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

const { RangePicker } = DatePicker;
const { Header, Sider, Content } = Layout;

export default function Home() {
  const { data: session } = useSession();
  const [user, setUser] = useState({
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
    `http://localhost:8080/api/rest/meetings/${parseInt(selectRoomNum)}`,
    fetcher
  );

  const warning = () => {
    Modal.warning({
      title: "예약할 수 없습니다",
      content: "해당 시간대에 예약이 있습니다.",
    });
  };
  const issue = () => {
    Modal.warning({
      title: "예약할 수 없습니다",
      content: "시간을 확인해주세요.",
    });
  };

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
  const onChange = (
    value: DatePickerProps["value"] | RangePickerProps["value"],
    dateString: [string, string]
  ) => {
    const formatData = dateString.map((date: string) => {
      return date.replace(" ", "T") + ":00+09:00";
    });
    setSelectDateTime(formatData);
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

  const handleCreate = () => {
    axios({
      method: "get",
      url: "http://localhost:8080/api/rest/search-meetings",
      params: {
        start_date: selectDateTime[0],
        end_date: selectDateTime[1],
      },
    })
      .then((res) => {
        if (res.data.meetings[0] === undefined) {
          axios
            .post("http://localhost:8080/api/rest/create-meeting", {
              company_name: user.company,
              end_date: selectDateTime[1],
              room_id: selectRoomNum,
              start_date: selectDateTime[0],
              user_id: user.id,
            })
            .then(() => {
              setModalOpen(false);
              setSelectDateTime(["", ""]);
              mutate();
            })
            .catch((err) => console.log("err", err));
        } else {
          warning();
        }
      })
      .catch((err) => {
        console.log("err", err);
      });
  };

  const onCancel = () => {
    setSelectDateTime(["", ""]);
    setModalOpen(false);
  };

  const handleModify = () => {
    const newEndDate =
      selectDateTime[1] === ""
        ? dateToTimestamp(selectEventData.end)
        : selectDateTime[1];
    const newStartDate =
      selectDateTime[0] === ""
        ? dateToTimestamp(selectEventData.start)
        : selectDateTime[0];
    if (newEndDate > newStartDate) {
      axios
        .patch(
          `http://localhost:8080/api/rest/update-meeting/${selectEventData.id}`,
          {
            end_date: newEndDate,
            start_date: newStartDate,
          }
        )
        .then(() => {
          setModifylModalOpen(false);
          mutate();
        })
        .catch((err) => console.log("err", err));
    } else {
      issue();
    }
  };

  const handleDelete = () => {
    axios
      .delete(
        `http://localhost:8080/api/rest/delete-meeting/${selectEventData.id}`
      )
      .then(() => {
        setDetailModalOpen(false);
        mutate();
      })
      .catch((err) => console.log(err));
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
        .get(`http://localhost:8080/api/rest/user/${session.user?.email}`)
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
          axios.post("http://localhost:8080/api/rest/users", {
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
              icon: <CalendarOutlined />,
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
                  headerToolbar={{
                    left: "prev,next today",
                    center: "title",
                    right: "dayGridMonth,timeGridWeek",
                  }}
                  selectable={true}
                  editable={false}
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
                <Modal
                  title="회의실 예약"
                  centered
                  open={modalOpen}
                  onOk={handleCreate}
                  okText="예약하기"
                  onCancel={onCancel}
                  cancelText="취소"
                >
                  <ModalContentWrapper>
                    <Input
                      placeholder="회사 명"
                      style={{ width: "50%" }}
                      defaultValue={user.company}
                      disabled
                    />
                    <Input
                      placeholder="예약자 명"
                      style={{ width: "50%" }}
                      defaultValue={user.name}
                      disabled
                    />
                    <Input
                      placeholder="예약 날짜"
                      style={{ width: "50%" }}
                      defaultValue={selectDate}
                      disabled
                    />
                    <TimePickerWrapper>
                      <TimePicker
                        value={dayjs(selectDateTime[0].slice(11, 16), "HH:mm")}
                        format="HH:mm"
                        placeholder="start time"
                        onChange={handleChangeStartDate}
                        style={{ width: "40%" }}
                        minuteStep={30}
                      />
                      <ArrowRightOutlined />
                      <TimePicker
                        value={dayjs(selectDateTime[1].slice(11, 16), "HH:mm")}
                        format="HH:mm"
                        placeholder="end time"
                        style={{ width: "40%" }}
                        onChange={handleChangeEndDate}
                        minuteStep={30}
                      />
                    </TimePickerWrapper>
                  </ModalContentWrapper>
                </Modal>

                <Modal
                  title={`예약 상세`}
                  centered
                  open={detailModalOpen}
                  onOk={() => {
                    setDetailModalOpen(false);
                    setModifylModalOpen(true);
                  }}
                  okText="수정하기"
                  footer={
                    user.id === selectEventData.userId
                      ? [
                          <ButtonContainer key="submit">
                            <Button
                              key="submit"
                              type="primary"
                              onClick={handleDelete}
                            >
                              삭제하기
                            </Button>
                          </ButtonContainer>,
                          <ButtonContainer key="submit">
                            <Button
                              key="submit"
                              type="primary"
                              onClick={() => {
                                setDetailModalOpen(false);
                                setModifylModalOpen(true);
                                setSelectDate(
                                  moment(selectEventData.start).format(
                                    "YYYY-MM-DD"
                                  )
                                );
                              }}
                            >
                              수정하기
                            </Button>
                          </ButtonContainer>,
                        ]
                      : []
                  }
                  onCancel={() => setDetailModalOpen(false)}
                  cancelText="취소"
                >
                  <ModalContentWrapper>
                    <Input
                      placeholder="회사 명"
                      style={{ width: "50%" }}
                      value={selectEventData.title}
                      disabled
                    />
                    <Input
                      placeholder="예약자 명"
                      style={{ width: "50%" }}
                      value={selectEventData.username}
                      disabled
                    />
                    <Input
                      placeholder="예약 날짜"
                      style={{ width: "50%" }}
                      defaultValue={selectDate}
                      disabled
                    />
                    {selectEventData && (
                      <TimePickerWrapper>
                        <TimePicker
                          value={dayjs(
                            dateToTimestamp(selectEventData.start).slice(
                              11,
                              16
                            ),
                            "HH:mm"
                          )}
                          format="HH:mm"
                          placeholder="start time"
                          style={{ width: "40%" }}
                          disabled
                        />
                        <ArrowRightOutlined />
                        <TimePicker
                          value={dayjs(
                            dateToTimestamp(selectEventData.end).slice(11, 16),
                            "HH:mm"
                          )}
                          format="HH:mm"
                          placeholder="end time"
                          style={{ width: "40%" }}
                          disabled
                        />
                      </TimePickerWrapper>
                    )}
                  </ModalContentWrapper>
                </Modal>

                <Modal
                  title={`예약 수정`}
                  centered
                  open={modifyModalOpen}
                  onOk={handleModify}
                  okText="저장하기"
                  onCancel={() => {
                    setModifylModalOpen(false);
                    setSelectDate("");
                    setSelectDateTime(["", ""]);
                  }}
                  cancelText="취소"
                >
                  <ModalContentWrapper>
                    <Input
                      placeholder="회사 명"
                      style={{ width: "50%" }}
                      value={selectEventData.title}
                      disabled
                    />
                    <Input
                      placeholder="예약자 명"
                      style={{ width: "50%" }}
                      value={selectEventData.username}
                      disabled
                    />
                    <Input
                      placeholder="예약 날짜"
                      style={{ width: "50%" }}
                      defaultValue={selectDate}
                      disabled
                    />
                    {selectEventData && (
                      <TimePickerWrapper>
                        <TimePicker
                          value={dayjs(
                            dateToTimestamp(
                              selectDateTime[0] === ""
                                ? selectEventData.start
                                : selectDateTime[0]
                            ).slice(11, 16),
                            "HH:mm"
                          )}
                          format="HH:mm"
                          placeholder="start time"
                          onChange={handleChangeStartDate}
                          style={{ width: "40%" }}
                          minuteStep={30}
                        />
                        <ArrowRightOutlined />
                        <TimePicker
                          value={dayjs(
                            dateToTimestamp(
                              selectDateTime[1] === ""
                                ? selectEventData.end
                                : selectDateTime[1]
                            ).slice(11, 16),
                            "HH:mm"
                          )}
                          format="HH:mm"
                          placeholder="end time"
                          style={{ width: "40%" }}
                          onChange={handleChangeEndDate}
                          minuteStep={30}
                        />
                      </TimePickerWrapper>
                    )}
                  </ModalContentWrapper>
                </Modal>
              </CalendarWrapper>
            </ContentWrapper>
          </Container>
        </Content>
      </Layout>
    </Layout>
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
const ModalContentWrapper = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 10px;
`;
const TimePickerWrapper = styled.div`
  width: 100%;
  display: flex;
  gap: 10px;
  align-items: center;
`;
const ButtonContainer = styled.span`
  margin-left: 5px;
  .ant-btn-primary {
    background-color: #2c3e50;
  }
`;
