import React, { useCallback, useEffect, useState } from "react";
import { Modal, Button, Form } from "react-bootstrap";
import { useDB } from "src/context/DBContext";
import { toast } from 'react-toastify';
import LoadingBlock, { LoadingBlockContainer } from "src/component/LoadingBlock";
import { Company } from "src/model/db";

type UpdateCompanyModalProps = {
  uuid: string | null;
  onConfirm: () => void;
  onCancel: () => void;
};

const UpdateCompanyModal: React.FC<UpdateCompanyModalProps> = ({ uuid, onConfirm, onCancel }) => {
  const db = useDB();
  const [company, setCompany] = useState<Company | null>(null);
  const [name, setName] = useState<string | null>(null);
  const [description, setDescription] = useState<string | null>(null);

  const getCompany = useCallback(
    async ()=>{
      if (db == null || uuid == null) {
        return;
      }
      const companies = (await db.read({companies: [uuid]}))['companies'];
      if (companies.length === 1) {
        setCompany(companies[0]);
      }
    },
    [db, uuid]
  );

  useEffect(
    ()=>{
      getCompany()
    },
    [getCompany]
  );

  const handleConfirm = async () => {
    if (db == null || uuid == null || company == null) {
      return;
    }
    const updatedCompany = {
      uuid,
      name: name || company.name,
      description: description || company.description,
    };
    try {
      await db.update({'companies': [updatedCompany]});
      setName(null);
      setDescription(null);
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
    setDescription(null);
    onCancel();
  }

  return (
    <Modal show={uuid!=null} onHide={handleCancel} centered>
      <Modal.Header closeButton>
        <Modal.Title>Update Company</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <LoadingBlockContainer>
          <Form>
            <Form.Group className="mb-3">
              <Form.Label>Name</Form.Label>
              <Form.Control
                type="text"
                placeholder="Enter name"
                value={name == null ? company?.name : name}
                onChange={(e) => setName(e.target.value)}
              />
            </Form.Group>
            <Form.Group controlId="companyContent" className="mb-3">
              <Form.Label>Description</Form.Label>
              <Form.Control
                as="textarea"
                rows={4}
                placeholder="Enter content"
                value={description == null ? company?.description : description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </Form.Group>
          </Form>
          {(!db || !company) && <LoadingBlock />}
        </LoadingBlockContainer>
      </Modal.Body>
      <Modal.Footer>
        <LoadingBlockContainer>
          <div className="d-flex w-100 justify-content-between">
            <Button variant="danger" onClick={handleCancel}>
              Cancel
            </Button>
            <Button variant="primary" onClick={handleConfirm} disabled={db == null || company == null || (name==null && description==null)}>
              Confirm
            </Button>
          </div>
          {(!db || !company) && <LoadingBlock />}
        </LoadingBlockContainer>
      </Modal.Footer>
    </Modal>
  );
};

export default UpdateCompanyModal;
