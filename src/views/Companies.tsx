import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowsRotate, faBriefcase, faGear, faPlus, faTrash } from "@fortawesome/free-solid-svg-icons";
import { useCallback, useEffect, useState } from "react";
import { Button, Card, Stack } from "react-bootstrap";
import { useDB } from "src/context/DBContext";
import CreateCompanyModal from 'src/views/CreateCompanyModal';
import UpdateCompanyModal from 'src/views/UpdateCompanyModal';
import CompanyJobViewModal from 'src/views/CompanyJobViewModal';
import { Company } from 'src/model/db';



const Companies: React.FunctionComponent = () => {
  const db = useDB();
  const [companies, setCompanies] = useState<ReadonlyArray<Company>>([]);
  const [showAddCompanyModal, setShowAddCompanyModal] = useState<boolean>(false);
  const [companyUUIDForUpdate, setCompanyUUIDForUpdate] = useState<string | null>(null);  // uuid of the company to edit
  const [companyUUIDForJobView, setCompanyUUIDForJobView] = useState<string | null>(null);  // uuid of the company to edit
  
  const syncAllCompanies = useCallback(
    async()=>{
      if (db == null) {
        return null;
      }
      const storage = await db.listAll(['companies']);
      const allCompanies = storage['companies'];
      setCompanies(allCompanies);
    },
    [db]
  );

  useEffect(
    ()=>{
      syncAllCompanies();
    },
    [syncAllCompanies]
  );

  if (db == null) {
    return null;
  }
  return (
    <div>
      <div className='d-flex justify-content-between mx-3'>
        <h3>Companies</h3>
        <Stack direction='horizontal' gap={1}>
          <Button size='sm' onClick={syncAllCompanies}><FontAwesomeIcon icon={faArrowsRotate} /></Button>
          <Button size='sm' onClick={()=>setShowAddCompanyModal(true)}><FontAwesomeIcon icon={faPlus} /></Button>
        </Stack>
      </div>
      <div className='d-grid' style={{gridTemplateColumns: 'repeat(auto-fill, minmax(600px, 1fr))'}}>
        {companies.map((exp, idx) => (
          <Card key={idx} className='mx-3'>
            <Card.Body>
              <Card.Title>
                <div className='d-flex justify-content-between mx-3'>
                  <b>{exp.name}</b>
                  <Stack direction='horizontal' gap={1}>
                    <Button size='sm' onClick={()=>setCompanyUUIDForUpdate(exp.uuid)}>
                      <FontAwesomeIcon icon={faGear} />
                    </Button>
                    <Button size='sm' onClick={()=>setCompanyUUIDForJobView(exp.uuid)}>
                      <FontAwesomeIcon icon={faBriefcase} />
                    </Button>
                    <Button size='sm' onClick={
                      ()=>{
                        db.delete({
                          'companies': [exp.uuid]
                        });
                        syncAllCompanies();
                      }
                    }>
                      <FontAwesomeIcon icon={faTrash} />
                    </Button>
                  </Stack>
                </div>
              </Card.Title>
              <Card.Text>
                {exp.description}
              </Card.Text>
            </Card.Body>
          </Card>
        ))}
      </div>
      <CreateCompanyModal
        show={showAddCompanyModal}
        onConfirm={()=>{
          setShowAddCompanyModal(false);
          syncAllCompanies();
        }}
        onCancel={()=>setShowAddCompanyModal(false)}
      />
      <UpdateCompanyModal
        uuid={companyUUIDForUpdate}
        onConfirm={()=>{
          setCompanyUUIDForUpdate(null);
          syncAllCompanies();
        }}
        onCancel={()=>setCompanyUUIDForUpdate(null)}
      />
      <CompanyJobViewModal
        companyUUID={companyUUIDForJobView}
        companyName={companies.filter(c=>c.uuid===companyUUIDForJobView)[0]?.name || null}
        onClose={()=>setCompanyUUIDForJobView(null)}
      />
    </div>
  );
};

export default Companies;
