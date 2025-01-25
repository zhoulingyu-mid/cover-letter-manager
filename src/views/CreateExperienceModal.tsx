import React, { useState } from "react";
import { Modal, Button, Form } from "react-bootstrap";
import { useDB } from "src/context/DBContext";
import { v4 as uuidv4 } from "uuid";
import { toast } from 'react-toastify';

type CreateExperienceModalProps = {
  show: boolean;
  onConfirm: () => void;
  onCancel: () => void;
};

const CreateExperienceModal: React.FC<CreateExperienceModalProps> = ({ show, onConfirm, onCancel }) => {
  const db = useDB();
  const [name, setName] = useState("");
  const [content, setContent] = useState("");

  if (db == null) {
    return null;
  }

  const handleConfirm = async () => {
    const newExperience = { uuid: uuidv4(), name, content };
    try {
      await db.create({ experiences: [newExperience] });
      setName("");
      setContent("");
      onConfirm();
    }
    catch (e){
      const message = e instanceof Error
        ? e.message
        : 'Unknown error'
      toast(message);
    }
  };

  const handleCancel = ()=>{
    setName("");
    setContent("");
    onCancel();
  }

  return (
    <Modal show={show} onHide={handleCancel} centered>
      <Modal.Header closeButton>
        <Modal.Title>Add Experience</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form>
          <Form.Group className="mb-3">
            <Form.Label>Name</Form.Label>
            <Form.Control
              type="text"
              placeholder="Enter name"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label>Content</Form.Label>
            <Form.Control
              as="textarea"
              rows={4}
              placeholder="Enter content"
              value={content}
              onChange={(e) => setContent(e.target.value)}
            />
          </Form.Group>
        </Form>
      </Modal.Body>
      <Modal.Footer>
        <div className="d-flex w-100 justify-content-between">
          <Button variant="danger" onClick={handleCancel}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleConfirm} disabled={!name || !content}>
            Confirm
          </Button>
        </div>
      </Modal.Footer>
    </Modal>
  );
};

export default CreateExperienceModal;
