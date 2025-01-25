import React, { useState } from "react";
import { Modal, Button, Form } from "react-bootstrap";
import { useDB } from "src/context/DBContext";
import { v4 as uuidv4 } from "uuid";
import { toast } from 'react-toastify';

type CreateJobModalProps = {
  show: boolean;
  companyUUID: string | null;
  onConfirm: () => void;
  onCancel: () => void;
};

const CreateJobModal: React.FC<CreateJobModalProps> = ({ show, companyUUID, onConfirm, onCancel }) => {
  const db = useDB();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");

  if (db == null) {
    return null;
  }

  const handleConfirm = async () => {
    if (db == null || companyUUID == null || title === "" || description === "") {
      return;
    }

    const newJob = {
      uuid: uuidv4(),
      company_uuid: companyUUID,
      title,
      date: new Date().valueOf(),
      description,
    };
    try {
      await db.create({ jobs: [newJob] });
      setTitle("");
      setDescription("");
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
    setTitle("");
    setDescription("");
    onCancel();
  }

  return (
    <Modal show={show} onHide={handleCancel} centered>
      <Modal.Header closeButton>
        <Modal.Title>Add Job</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form>
          <Form.Group className="mb-3">
            <Form.Label>Title</Form.Label>
            <Form.Control
              type="text"
              placeholder="Enter name"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              onKeyDown={(e)=>{
                if (e.key === 'Escape') {
                  setTitle("");
                }
              }}
            />
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label>Description</Form.Label>
            <Form.Control
              as="textarea"
              rows={4}
              placeholder="Enter content"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              onKeyDown={(e)=>{
                if (e.key === 'Escape') {
                  setTitle("");
                }
              }}
            />
          </Form.Group>
        </Form>
      </Modal.Body>
      <Modal.Footer>
        <div className="d-flex w-100 justify-content-between">
          <Button variant="danger" onClick={handleCancel}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleConfirm} disabled={db == null || companyUUID == null || title === "" || description === ""}>
            Confirm
          </Button>
        </div>
      </Modal.Footer>
    </Modal>
  );
};

export default CreateJobModal;
