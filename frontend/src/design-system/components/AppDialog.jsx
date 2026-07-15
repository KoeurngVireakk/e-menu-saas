import Modal from "../../components/ui/Modal";

export default function AppDialog({ open, title, description, children, footer, onClose }) {
  return (
    <Modal
      open={open}
      title={title}
      description={description}
      onClose={onClose}
      footer={footer ? <footer className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">{footer}</footer> : null}
    >
      <div className="p-5">{children}</div>
    </Modal>
  );
}
