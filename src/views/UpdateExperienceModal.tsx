import React, { useCallback, useEffect, useState } from "react";
import { Modal, Button, Form } from "react-bootstrap";
import { useDB } from "src/context/DBContext";
import { toast } from 'react-toastify';
import LoadingBlock, { LoadingBlockContainer } from "src/component/LoadingBlock";
import { Experience } from "src/model/db";

type UpdateExperienceModalProps = {
  uuid: string | null;
  onConfirm: () => void;
  onCancel: () => void;
};

const UpdateExperienceModal: React.FC<UpdateExperienceModalProps> = ({ uuid, onConfirm, onCancel }) => {
  const db = useDB();
  const [experience, setExperience] = useState<Experience | null>(null);
  const [name, setName] = useState<string | null>(null);
  const [content, setContent] = useState<string | null>(null);

  const getExperience = useCallback(
    async ()=>{
      if (db == null || uuid == null) {
        return;
      }
      const experiences = (await db.read({experiences: [uuid]}))['experiences'];
      if (experiences.length === 1) {
        setExperience(experiences[0]);
      }
    },
    [db, uuid]
  );

  useEffect(
    ()=>{
      getExperience()
    },
    [getExperience]
  );

  const handleConfirm = async () => {
    if (db == null || uuid == null || experience == null) {
      return;
    }
    const updatedExperience = {
      uuid,
      name: name || experience.name,
      content: content || experience.content,
    };
    try {
      await db.update({'experiences': [updatedExperience]});
      setName(null);
      setContent(null);
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
    setName(null);
    setContent(null);
    onCancel();
  }

  return (
    <Modal show={uuid!=null} onHide={handleCancel} centered>
      <Modal.Header closeButton>
        <Modal.Title>Update Experience</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <LoadingBlockContainer>
          <Form>
            <Form.Group className="mb-3">
              <Form.Label>Name</Form.Label>
              <Form.Control
                type="text"
                placeholder="Enter name"
                value={name == null ? experience?.name : name}
                onChange={(e) => setName(e.target.value)}
              />
            </Form.Group>
            <Form.Group controlId="experienceContent" className="mb-3">
              <Form.Label>Content</Form.Label>
              <Form.Control
                as="textarea"
                rows={4}
                placeholder="Enter content"
                value={content == null ? experience?.content : content}
                onChange={(e) => setContent(e.target.value)}
              />
            </Form.Group>
          </Form>
          {(!db || !experience) && <LoadingBlock />}
        </LoadingBlockContainer>
      </Modal.Body>
      <Modal.Footer>
        <LoadingBlockContainer>
          <div className="d-flex w-100 justify-content-between">
            <Button variant="danger" onClick={handleCancel}>
              Cancel
            </Button>
            <Button variant="primary" onClick={handleConfirm} disabled={!db || !experience || (!name && !content)}>
              Confirm
            </Button>
          </div>
          {(!db || !experience) && <LoadingBlock />}
        </LoadingBlockContainer>
      </Modal.Footer>
    </Modal>
  );
};

export default UpdateExperienceModal;
