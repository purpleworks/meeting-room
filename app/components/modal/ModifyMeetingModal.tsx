import { TEvent } from "@/app/type/meeting";
import { ArrowRightOutlined } from "@ant-design/icons";
import { Input, Modal, TimePicker } from "antd";
import axios from "axios";
import dayjs, { Dayjs } from "dayjs";
import { styled } from "styled-components";
import { MutatorOptions } from "swr";

interface IModifyMeetingModalProps {
  modifyModalOpen: boolean;
  selectEventData: TEvent;
  onModifyMeetingCancel: () => void;
  selectDate: string;
  selectDateTime: string[];
  onChangeStartDate: (value: Dayjs | null, dateString: string) => void;
  onChangeEndDate: (value: Dayjs | null, dateString: string) => void;
  mutate: () => void;
  onChangeModifyModal: (open: boolean) => void;
  setSelectDateTime: (data: string[]) => void;
  dateToTimestamp: (date: Date | string | null) => string;
}

const ModifyMeetingModal = (props: IModifyMeetingModalProps) => {
  const {
    modifyModalOpen,
    onModifyMeetingCancel,
    selectEventData,
    selectDate,
    selectDateTime,
    onChangeStartDate,
    onChangeEndDate,
    mutate,
    onChangeModifyModal,
    setSelectDateTime,
    dateToTimestamp,
  } = props;
  const issue = () => {
    Modal.warning({
      title: "예약할 수 없습니다",
      content: "시간을 확인해주세요.",
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
          mutate();
        })
        .catch((err) => console.log("err", err));
    } else {
      issue();
    }
  };

  return (
    <Modal
      title={`예약 수정`}
      centered
      open={modifyModalOpen}
      onOk={handleModify}
      okText="저장하기"
      onCancel={onModifyMeetingCancel}
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
              onChange={onChangeStartDate}
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
              onChange={onChangeEndDate}
              minuteStep={30}
            />
          </TimePickerWrapper>
        )}
      </ModalContentWrapper>
    </Modal>
  );
};

export default ModifyMeetingModal;

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
