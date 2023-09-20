import { TEvent } from "@/app/type/meeting";
import { TUser } from "@/app/type/user";
import { ArrowRightOutlined } from "@ant-design/icons";
import { Button, Input, Modal, TimePicker } from "antd";
import axios from "axios";
import dayjs from "dayjs";
import { styled } from "styled-components";
import { MutatorOptions } from "swr";

interface IDetailMeetingModalProps {
  user: TUser;
  selectEventData: TEvent;
  detailModalOpen: boolean;
  onChangeDetailModal: (open: boolean) => void;
  onChangeModifyModal: (open: boolean) => void;
  mutate: (
    data?: unknown,
    opts?: boolean | MutatorOptions<any, unknown> | undefined
  ) => Promise<unknown>;
  selectDate: string;
  setSelectDate: (data: string) => void;
  dateToTimestamp: (date: Date | string | null) => string;
}

const DetailMeetingModal = (props: IDetailMeetingModalProps) => {
  const moment = require("moment");
  const {
    user,
    selectEventData,
    onChangeDetailModal,
    mutate,
    detailModalOpen,
    onChangeModifyModal,
    setSelectDate,
    selectDate,
    dateToTimestamp,
  } = props;
  const handleDelete = () => {
    axios
      .delete(`/api/rest/delete-meeting/${selectEventData.id}`)
      .then(() => {
        onChangeDetailModal(false);
        mutate();
      })
      .catch((err) => console.log(err));
  };
  return (
    <Modal
      title={`예약 상세`}
      centered
      open={detailModalOpen}
      onOk={() => {
        onChangeDetailModal(false);
        onChangeModifyModal(true);
      }}
      okText="수정하기"
      footer={
        user.id === selectEventData.userId
          ? [
              <ButtonContainer key="submit">
                <Button key="submit" type="primary" onClick={handleDelete}>
                  삭제하기
                </Button>
              </ButtonContainer>,
              <ButtonContainer key="submit">
                <Button
                  key="submit"
                  type="primary"
                  onClick={() => {
                    onChangeDetailModal(false);
                    onChangeModifyModal(true);
                    setSelectDate(
                      moment(selectEventData.start).format("YYYY-MM-DD")
                    );
                  }}
                >
                  수정하기
                </Button>
              </ButtonContainer>,
            ]
          : []
      }
      onCancel={() => onChangeDetailModal(false)}
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
                dateToTimestamp(selectEventData.start).slice(11, 16),
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
  );
};

export default DetailMeetingModal;

const ButtonContainer = styled.span`
  margin-left: 5px;
  .ant-btn-primary {
    background-color: #2c3e50;
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
