import { Form, Input } from "antd-mobile";
import { TimePicker } from "antd";
import dayjs, { Dayjs } from "dayjs";
import { ArrowRightOutlined } from "@ant-design/icons";
import { styled } from "styled-components";
import { TEvent } from "@/app/type/meeting";
import { useEffect } from "react";

interface IModifyMeetingModalProps {
  selectEventData: TEvent;
  selectDate: string;
  selectDateTime: string[];
  onChangeStartDate: (value: Dayjs | null, dateString: string) => void;
  onChangeEndDate: (value: Dayjs | null, dateString: string) => void;
  dateToTimestamp: (date: Date | string | null) => string;
}

const MobileModifyMeetingModalContent = (props: IModifyMeetingModalProps) => {
  const {
    selectEventData,
    selectDate,
    selectDateTime,
    onChangeStartDate,
    onChangeEndDate,
    dateToTimestamp,
  } = props;

  console.log(
    "change",
    selectDateTime[0] === "" ? selectEventData.start : selectDateTime[0]
  );
  useEffect(() => {
    console.log(
      "use",
      selectDateTime[0] === "" ? selectEventData.start : selectDateTime[0]
    );
  }, [selectDateTime]);
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
                // onOk={(date) => console.log(date)}
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
        </Form.Item>
      </Form>
    </Container>
  );
};

export default MobileModifyMeetingModalContent;

const Container = styled.div`
  width: 100%;
  margin: 8px;
`;
const TimePickerWrapper = styled.div`
  width: 100%;
  display: flex;
  gap: 10px;
  align-items: center;
`;
