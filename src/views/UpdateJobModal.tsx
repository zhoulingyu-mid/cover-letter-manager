import React, { useCallback, useEffect, useState } from "react";
import { Modal, Button, Form } from "react-bootstrap";
import { useDB } from "src/context/DBContext";
import { toast } from 'react-toastify';
import LoadingBlock, { LoadingBlockContainer } from "src/component/LoadingBlock";
import { Company, Job } from "src/model/db";

type UpdateJobModalProps = {
  uuid: string | null;
  onConfirm: () => void;
  onCancel: () => void;
};

const UpdateJobModal: React.FC<UpdateJobModalProps> = ({ uuid, onConfirm, onCancel }) => {
  const db = useDB();
  const [job, setJob] = useState<Job | null>(null);
  const [companies, setCompanies] = useState<ReadonlyArray<Company>>([]);
  const [companyUUID, setCompanyUUID] = useState<string | null>(null);
  const [title, setTitle] = useState<string | null>(null);
  const [description, setDescription] = useState<string | null>(null);

  const syncJob = useCallback(
    async ()=>{
      if (db == null || uuid == null) {
        return;
      }
      const jobs = (await db.read({jobs: [uuid]}))['jobs'];
      console.log({uuid, jobs});
      if (jobs.length === 1) {
        setJob(jobs[0]);
      }
    },
    [db, uuid]
  );

  const syncCompanies = useCallback(
    async ()=>{
      if (db == null) {
        return;
      }
      const storage = await db.listAll(['companies', 'jobs']);
      console.log(storage['jobs']);
      const allCompanies = storage['companies'];
      setCompanies(allCompanies);
    },
    [db]
  );

  useEffect(
    ()=>{
      syncJob();
      syncCompanies();
    },
    [syncJob, syncCompanies]
  );

  const handleConfirm = async () => {
    if (db == null || uuid == null || job == null) {
      return;
    }
    const updatedJob = {
      uuid,
      company_uuid: companyUUID || job.company_uuid,
      title: title || job.title,
      date: job.date,
      description: description || job.description,
      cover_letter: job.cover_letter,
    };
    try {
      await db.update({'jobs': [updatedJob]});
      setCompanyUUID(null);
      setTitle(null);
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
    setCompanyUUID(null);
    setTitle(null);
    setDescription(null);
    onCancel();
  }

  return (
    <Modal show={uuid!=null} onHide={handleCancel} centered>
      <Modal.Header closeButton>
        <Modal.Title>Update Job</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <LoadingBlockContainer>
          <Form>
            <Form.Group className="mb-3">
              <Form.Select value={job?.company_uuid}>
                {companies.map((c)=>
                  <option key={c.uuid} value={c.uuid}>{c.name}</option>
                )}
              </Form.Select>
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Title</Form.Label>
              <Form.Control
                type="text"
                placeholder="Enter name"
                value={title == null ? job?.title : title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Description</Form.Label>
              <Form.Control
                as="textarea"
                rows={4}
                placeholder="Enter description"
                value={description == null ? job?.description : description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </Form.Group>
          </Form>
          {(db == null || job == null) && <LoadingBlock />}
        </LoadingBlockContainer>
      </Modal.Body>
      <Modal.Footer>
        <LoadingBlockContainer>
          <div className="d-flex w-100 justify-content-between">
            <Button variant="danger" onClick={handleCancel}>
              Cancel
            </Button>
            <Button variant="primary" onClick={handleConfirm} disabled={db == null || uuid == null || job == null}>
              Confirm
            </Button>
          </div>
          {(db == null || job == null) && <LoadingBlock />}
        </LoadingBlockContainer>
      </Modal.Footer>
    </Modal>
  );
};

export default UpdateJobModal;
