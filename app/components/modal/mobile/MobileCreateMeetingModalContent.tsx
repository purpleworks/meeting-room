import { Form, Input } from "antd-mobile";
import { TimePicker } from "antd";
import dayjs, { Dayjs } from "dayjs";
import { ArrowRightOutlined } from "@ant-design/icons";
import { styled } from "styled-components";
import { TUser } from "@/app/type/user";

interface ICreateMeetingModalProps {
  user: TUser;
  selectDate: string;
  selectDateTime: string[];
  onChangeStartDate: (value: Dayjs | null, dateString: string) => void;
  onChangeEndDate: (value: Dayjs | null, dateString: string) => void;
}

const MobileCreateMeetingModalContent = (props: ICreateMeetingModalProps) => {
  const {
    user,
    selectDate,
    selectDateTime,
    onChangeStartDate,
    onChangeEndDate,
  } = props;

  return (
    <Container>
      <Form
        initialValues={{
          company: user.company,
          name: user.name,
          date: selectDate,
        }}
        mode="card"
      >
        <Form.Item name="company" label="회사 명">
          <Input placeholder="회사 명" disabled />
        </Form.Item>
        <Form.Item name="name" label="예약자 명">
          <Input placeholder="예약자명" disabled />
        </Form.Item>
        <Form.Item name="date" label="예약 날짜">
          <Input placeholder="예약 날짜" disabled />
        </Form.Item>
        <Form.Item name="time" label="예약시간">
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
        </Form.Item>
      </Form>
    </Container>
  );
};

export default MobileCreateMeetingModalContent;

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
