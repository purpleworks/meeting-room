import { TUser } from "@/app/type/user";
import { ArrowRightOutlined } from "@ant-design/icons";
import { Input, Modal, TimePicker } from "antd";
import axios from "axios";
import dayjs, { Dayjs } from "dayjs";
import { styled } from "styled-components";
import { MutatorOptions } from "swr";

interface ICreateMeetingModalProps {
  modalOpen: boolean;
  selectRoomNum: string;
  mutate: (
    data?: unknown,
    opts?: boolean | MutatorOptions<any, unknown> | undefined
  ) => Promise<unknown>;
  onCreateMeetingCancel: () => void;
  user: TUser;
  selectDate: string;
  selectDateTime: string[];
  onChangeStartDate: (value: Dayjs | null, dateString: string) => void;
  onChangeEndDate: (value: Dayjs | null, dateString: string) => void;
}

const CreateMeetingModal = (props: ICreateMeetingModalProps) => {
  const {
    modalOpen,
    selectRoomNum,
    mutate,
    onCreateMeetingCancel,
    user,
    selectDate,
    selectDateTime,
    onChangeStartDate,
    onChangeEndDate,
  } = props;

  const warning = () => {
    Modal.warning({
      title: "예약할 수 없습니다",
      content: "해당 시간대에 예약이 있습니다.",
    });
  };
  const login = () => {
    Modal.warning({
      title: "예약할 수 없습니다",
      content: "로그인이 필요합니다.",
    });
  };

  const handleCreate = () => {
    axios({
      method: "get",
      url: `/api/rest/search-meetings/${selectDateTime[0]}/${selectDateTime[1]}`,
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
              mutate();
            })
            .catch(() => login());
        } else {
          warning();
        }
      })
      .catch((err) => {
        console.log("err", err);
      });
  };

  return (
    <Modal
      title="회의실 예약"
      centered
      open={modalOpen}
      onOk={handleCreate}
      okText="예약하기"
      onCancel={onCreateMeetingCancel}
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
            onChange={onChangeStartDate}
            style={{ width: "40%" }}
            minuteStep={30}
          />
          <ArrowRightOutlined />
          <TimePicker
            value={dayjs(selectDateTime[1].slice(11, 16), "HH:mm")}
            format="HH:mm"
            placeholder="end time"
            style={{ width: "40%" }}
            onChange={onChangeEndDate}
            minuteStep={30}
          />
        </TimePickerWrapper>
      </ModalContentWrapper>
    </Modal>
  );
};

export default CreateMeetingModal;

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
