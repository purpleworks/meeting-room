import FullCalendar from "@fullcalendar/react";
import interactionPlugin, { DateClickArg } from "@fullcalendar/interaction";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import { styled } from "styled-components";
import { Modal } from "antd-mobile";
import MobileCreateMeetingModalContent from "../../modal/mobile/MobileCreateMeetingModalContent";
import MobileModifyMeetingModalContent from "../../modal/mobile/MobileModifyMeetingModalContent";
import { TUser } from "@/app/type/user";
import { EventClickArg, EventInput } from "@fullcalendar/core/index.js";
import { Dayjs } from "dayjs";
import axios from "axios";
import { Issue, Login, Warning } from "../../modal/WarningModal";
import MobileDetailMeetingModalContent from "../../modal/mobile/MobileDetailMeetingModalContent";
import { useCallback } from "react";

interface IEvent {
  id: number;
  title: string;
  username: string;
  userId: number;
  start: Date | null;
  end: Date | null;
}
interface IMobileCalendarProps {
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

const MobileCalendar = (props: IMobileCalendarProps) => {
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

  const handleCreate = () => {
    axios({
      method: "get",
      url: `/api/rest/search-meetings/${selectRoomNum}/${selectDateTime[0]}/${selectDateTime[1]}`,
    })
      .then((res) => {
        if (res.data.meetings[0] === undefined) {
          axios
            .post("/api/rest/create-meeting", {
              company_name: user.company,
              end_date: selectDateTime[1],
              room_id: selectRoomNum,
              start_date: selectDateTime[0],
              user_id: user.id,
            })
            .then(() => {
              onCreateMeetingCancel();
              isMutate();
            })
            .catch(() => Login());
        } else {
          Warning();
        }
      })
      .catch((err) => {
        console.log("err", err);
      });
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
        .patch(`/api/rest/update-meeting/${selectEventData.id}`, {
          end_date: newEndDate,
          start_date: newStartDate,
        })
        .then(() => {
          onChangeModifyModal(false);
          setSelectDateTime(["", ""]);
          isMutate();
        })
        .catch((err) => console.log("err", err));
    } else {
      Issue();
    }
  };
  const handleDelete = () => {
    axios
      .delete(`/api/rest/delete-meeting/${selectEventData.id}`)
      .then(() => {
        onChangeDetailModal(false);
        isMutate();
      })
      .catch((err) => console.log(err));
  };

  const handleOpenCreateMeetingModal = useCallback(
    (dateTime?: string[], date?: string) => {
      {
        dateTime &&
          date &&
          Modal.alert({
            content: (
              <MobileCreateMeetingModalContent
                onChangeEndDate={onChangeEndDate}
                onChangeStartDate={onChangeStartDate}
                selectDate={date}
                selectDateTime={dateTime}
                user={user}
              />
            ),
            confirmText: "예약",
            showCloseButton: true,
            onConfirm: handleCreate,
            onClose: onCreateMeetingCancel,
          });
      }
    },
    [user]
  );
  if (createModalOpen) {
    Modal.alert({
      content: (
        <MobileCreateMeetingModalContent
          onChangeEndDate={onChangeEndDate}
          onChangeStartDate={onChangeStartDate}
          selectDate={selectDate}
          selectDateTime={selectDateTime}
          user={user}
        />
      ),
      confirmText: "예약",
      showCloseButton: true,
      onConfirm: handleCreate,
      onClose: onCreateMeetingCancel,
    });
  }
  if (detailModalOpen) {
    Modal.show({
      content: (
        <MobileDetailMeetingModalContent
          selectDate={selectDate}
          selectEventData={selectEventData}
          dateToTimestamp={dateToTimestamp}
        />
      ),
      actions: [
        {
          key: "modify",
          text: "수정",
          primary: true,
        },
        {
          key: "delete",
          text: "삭제",
        },
      ],
      showCloseButton: true,
      onAction: (action, index) => {
        if (action.key === "modify") {
          onChangeDetailModal(false);
          onChangeModifyModal(true);
        }
        if (action.key === "delete") {
          handleDelete();
        }
      },
      onClose: () => onChangeDetailModal(false),
    });
  }
  if (modifyModalOpen) {
    Modal.alert({
      content: (
        <MobileModifyMeetingModalContent
          onChangeEndDate={onChangeEndDate}
          onChangeStartDate={onChangeStartDate}
          selectDate={selectDate}
          selectDateTime={selectDateTime}
          selectEventData={selectEventData}
          dateToTimestamp={dateToTimestamp}
        />
      ),
      confirmText: "예약",
      showCloseButton: true,
      onConfirm: handleModify,
      onClose: onModifyMeetingCancel,
    });
  }

  return (
    <CalendarWrapper>
      <FullCalendar
        plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
        initialView="timeGridDay"
        events={refetchData}
        allDaySlot={false}
        headerToolbar={{
          left: "",
          center: "title",
          right: "prev,next today",
        }}
        selectable={true}
        editable={false}
        slotMinTime="08:00:00"
        slotMaxTime="20:00:00"
        expandRows={true}
        dateClick={(arg) => {
          onClickDate(arg);
        }}
        eventClick={onClickEvent}
        titleFormat={{
          day: "2-digit",
          month: "2-digit",
        }}
        locale={"ko"}
      />
    </CalendarWrapper>
  );
};

export default MobileCalendar;

const CalendarWrapper = styled.div`
  width: 90%;
  height: 100%;
  .fc-direction-ltr {
    height: 100%;
  }
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
