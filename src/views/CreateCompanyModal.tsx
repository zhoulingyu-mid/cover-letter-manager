import React, { useState } from "react";
import { Modal, Button, Form } from "react-bootstrap";
import { useDB } from "src/context/DBContext";
import { v4 as uuidv4 } from "uuid";
import { toast } from 'react-toastify';

type CreateCompanyModalProps = {
  show: boolean;
  onConfirm: () => void;
  onCancel: () => void;
};

const CreateCompanyModal: React.FC<CreateCompanyModalProps> = ({ show, onConfirm, onCancel }) => {
  const db = useDB();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");

  if (db == null) {
    return null;
  }

  const handleConfirm = async () => {
    const newCompany = { uuid: uuidv4(), name, description };
    try {
      await db.create({ companies: [newCompany] });
      setName("");
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
    setName("");
    setDescription("");
    onCancel();
  }

  return (
    <Modal show={show} onHide={handleCancel} centered>
      <Modal.Header closeButton>
        <Modal.Title>Add Company</Modal.Title>
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
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </Form.Group>
        </Form>
      </Modal.Body>
      <Modal.Footer>
        <div className="d-flex w-100 justify-content-between">
          <Button variant="danger" onClick={handleCancel}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleConfirm} disabled={!name || !description}>
            Confirm
          </Button>
        </div>
      </Modal.Footer>
    </Modal>
  );
};

export default CreateCompanyModal;
