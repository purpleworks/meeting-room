import { Form, Input } from "antd-mobile";
import { TimePicker } from "antd";
import dayjs from "dayjs";
import { ArrowRightOutlined } from "@ant-design/icons";
import { styled } from "styled-components";
import { TEvent } from "@/app/type/meeting";

interface IDetailMeetingModalProps {
  selectEventData: TEvent;
  selectDate: string;
  dateToTimestamp: (date: Date | string | null) => string;
}

const MobileDetailMeetingModalContent = (props: IDetailMeetingModalProps) => {
  const { selectEventData, selectDate, dateToTimestamp } = props;

  return (
    <Container>
      <Form mode="card">
        <Form.Item name="company" label="회사 명">
          <Input
            placeholder="회사 명"
            defaultValue={selectEventData.title}
            disabled
          />
        </Form.Item>
        <Form.Item name="name" label="예약자 명">
          <Input
            placeholder="예약자명"
            defaultValue={selectEventData.username}
            disabled
          />
        </Form.Item>
        <Form.Item name="date" label="예약 날짜">
          <Input placeholder="예약 날짜" defaultValue={selectDate} disabled />
        </Form.Item>
        <Form.Item name="time" label="예약시간">
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
        </Form.Item>
      </Form>
    </Container>
  );
};

export default MobileDetailMeetingModalContent;

const Container = styled.div`
  width: 100%;
  /* margin: 8px; */
`;
const TimePickerWrapper = styled.div`
  width: 100%;
  display: flex;
  gap: 10px;
  align-items: center;
`;
