import { Modal } from "antd";
import { signOut } from "next-auth/react";

export const Warning = () => {
  Modal.warning({
    title: "예약할 수 없습니다",
    content: "해당 시간대에 예약이 있습니다.",
  });
};

export const Login = () => {
  Modal.warning({
    title: "예약할 수 없습니다",
    content: "로그인이 필요합니다.",
  });
};

export const Issue = () => {
  Modal.warning({
    title: "예약할 수 없습니다",
    content: "시간을 확인해주세요.",
  });
};

export const NotLogin = () => {
  Modal.warning({
    title: "로그인 할 수 없는 계정입니다.",
    content: "관리자에게 문의하세요.",
    onOk() {
      signOut();
    },
  });
};
