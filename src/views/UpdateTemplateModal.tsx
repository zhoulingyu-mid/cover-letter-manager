import React, { useCallback, useEffect, useState } from "react";
import { Modal, Button, Form } from "react-bootstrap";
import { useDB } from "src/context/DBContext";
import { toast } from 'react-toastify';
import LoadingBlock, { LoadingBlockContainer } from "src/component/LoadingBlock";
import { Template } from "src/model/db";

type UpdateTemplateModalProps = {
  uuid: string | null;
  onConfirm: () => void;
  onCancel: () => void;
};

const UpdateTemplateModal: React.FC<UpdateTemplateModalProps> = ({ uuid, onConfirm, onCancel }) => {
  const db = useDB();
  const [template, setTemplate] = useState<Template | null>(null);
  const [name, setName] = useState<string | null>(null);
  const [content, setContent] = useState<string | null>(null);

  const getTemplate = useCallback(
    async ()=>{
      if (db == null || uuid == null) {
        return;
      }
      const templates = (await db.read({templates: [uuid]}))['templates'];
      if (templates.length === 1) {
        setTemplate(templates[0]);
      }
    },
    [db, uuid]
  );

  useEffect(
    ()=>{
      getTemplate()
    },
    [getTemplate]
  );

  const handleConfirm = async () => {
    if (uuid == null || db == null || template == null) {
      return;
    }
    const updatedTemplate = {
      uuid,
      name: name || template.name,
      content: content || template.content,
    };
    console.log({updatedTemplate});
    try {
      await db.update({'templates': [updatedTemplate]});
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
        <Modal.Title>Update Template</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <LoadingBlockContainer>
          <Form>
            <Form.Group className="mb-3">
              <Form.Label>Name</Form.Label>
              <Form.Control
                type="text"
                placeholder="Enter name"
                value={name == null ? template?.name : name}
                onChange={(e) => setName(e.target.value)}
              />
            </Form.Group>
            <Form.Group controlId="templateContent" className="mb-3">
              <Form.Label>Content</Form.Label>
              <Form.Control
                as="textarea"
                rows={4}
                placeholder="Enter content"
                value={content == null ? template?.content : content}
                onChange={(e) => setContent(e.target.value)}
              />
            </Form.Group>
          </Form>
          {(!db || !template) && <LoadingBlock />}
        </LoadingBlockContainer>
      </Modal.Body>
      <Modal.Footer>
        <LoadingBlockContainer>
          <div className="d-flex w-100 justify-content-between">
            <Button variant="danger" onClick={handleCancel}>
              Cancel
            </Button>
            <Button variant="primary" onClick={handleConfirm} disabled={!db || !template || (!name && !content)}>
              Confirm
            </Button>
          </div>
          {(!db || !template) && <LoadingBlock />}
        </LoadingBlockContainer>
      </Modal.Footer>
    </Modal>
  );
};

export default UpdateTemplateModal;
