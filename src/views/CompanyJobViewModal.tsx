import React, { useCallback, useEffect, useState } from "react";
import { Modal, Button, Card, Stack, Accordion } from "react-bootstrap";
import { useDB } from "src/context/DBContext";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowsRotate, faGear, faHammer, faPlus, faTrash } from "@fortawesome/free-solid-svg-icons";
import CreateJobModal from "src/views/CreateJobModal";
import UpdateJobModal from "src/views/UpdateJobModal";
import { Job } from "src/model/db";
import CoverLetterGeneratorModal from "src/views/CoverLetterGeneratorModal";

type CreateExperienceModalProps = {
  companyUUID: string | null;
  companyName: string | null;
  onClose: () => void;
};

const CompanyJobViewModal: React.FC<CreateExperienceModalProps> = ({ companyUUID, companyName, onClose }) => {
  const db = useDB();
  const [jobs, setJobs] = useState<ReadonlyArray<Job>>([]);
  const [showAddJobModal, setShowAddJobModal] = useState<boolean>(false);
  const [jobUUIDForUpdate, setJobUUIDForUpdate] = useState<string | null>(null);
  const [jobUUIDForCoverLetterEdit, setJobUUIDForCoverLetterEdit] = useState<string | null>(null);

  const syncCompanyJobs = useCallback(
    async()=>{
      if (db == null || companyUUID == null) {
        return null;
      }
      const comapnyJobs = await db.listAllJobsByCompany(companyUUID);
      setJobs(comapnyJobs);
    },
    [db, companyUUID]
  );

  useEffect(
    ()=>{
      syncCompanyJobs();
    },
    [syncCompanyJobs]
  );

  if (db == null) {
    return null;
  }

  return (
    <Modal show={companyUUID != null} onHide={onClose} size='lg'>
      <Modal.Header closeButton>
        <Modal.Title>
          <div className='d-flex justify-content-between mx-3'>
            <h3>{companyName}</h3>
            <Stack direction='horizontal' gap={1}>
              <Button size='sm' onClick={syncCompanyJobs}><FontAwesomeIcon icon={faArrowsRotate} /></Button>
              <Button size='sm' onClick={()=>setShowAddJobModal(true)}><FontAwesomeIcon icon={faPlus} /></Button>
            </Stack>
          </div>
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <div className='d-grid' style={{gridTemplateColumns: 'repeat(auto-fill, minmax(600px, 1fr))'}}>
          {jobs.map((job, idx) => (
            <Card key={idx} className='mx-3'>
              <Card.Body>
                <Card.Title>
                    <div className='d-flex justify-content-between mx-3'>
                    <b>{job.title}</b>
                    <Stack direction='horizontal' gap={1}>
                      <Button size='sm' onClick={
                        ()=>{
                          setJobUUIDForUpdate(job.uuid);
                        }
                      }>
                        <FontAwesomeIcon icon={faGear} />
                      </Button>
                      <Button size='sm' onClick={
                        ()=>{
                          setJobUUIDForCoverLetterEdit(job.uuid);
                        }
                      }>
                        <FontAwesomeIcon icon={faHammer} />
                      </Button>
                      <Button size='sm' onClick={
                        ()=>{
                          db.delete({
                            'jobs': [job.uuid]
                          });
                          syncCompanyJobs();
                        }
                      }>
                        <FontAwesomeIcon icon={faTrash} />
                      </Button>
                    </Stack>
                    </div>
                </Card.Title>
                <Card.Text>
                    <Accordion defaultActiveKey="0">
                      <Accordion.Item eventKey="0">
                        <Accordion.Header>Description</Accordion.Header>
                        <Accordion.Body>
                          {job.description}
                        </Accordion.Body>
                      </Accordion.Item>
                      <Accordion.Item eventKey="1">
                        <Accordion.Header>Cover Letter</Accordion.Header>
                        <Accordion.Body>
                          {job.cover_letter}
                        </Accordion.Body>
                      </Accordion.Item>
                    </Accordion>
                </Card.Text>
              </Card.Body>
            </Card>
          ))}
          <CreateJobModal
            show={showAddJobModal}
            companyUUID={companyUUID}
            onConfirm={()=>{
              setShowAddJobModal(false);
              syncCompanyJobs();
            }}
            onCancel={()=>setShowAddJobModal(false)}
          />
          <UpdateJobModal
            uuid={jobUUIDForUpdate}
            onConfirm={()=>{
              setJobUUIDForUpdate(null);
              syncCompanyJobs();
            }}
            onCancel={()=>setJobUUIDForUpdate(null)}
          />
          <CoverLetterGeneratorModal
            jobUUID={jobUUIDForCoverLetterEdit}
            companyUUID={companyUUID}
            onCancel={
              ()=>{
                setJobUUIDForCoverLetterEdit(null);
              }
            }
            onConfirm={
              ()=>{
                setJobUUIDForCoverLetterEdit(null);
                syncCompanyJobs();
              }
            }
          />
        </div>
      </Modal.Body>
      <Modal.Footer>
        <div className="d-flex w-100 justify-content-between">
          <Button variant="danger" onClick={onClose}>
            Close
          </Button>
        </div>
      </Modal.Footer>
    </Modal>
  );
};

export default CompanyJobViewModal;
