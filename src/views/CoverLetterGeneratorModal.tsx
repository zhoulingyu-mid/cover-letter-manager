import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Modal, Button, Form } from "react-bootstrap";
import { toast } from "react-toastify";
import LoadingBlock from "src/component/LoadingBlock";
import { useDB } from "src/context/DBContext";
import { textToBlobHref } from "src/lib/textToBlobHref";
import { Company, Job, Experience, Template } from "src/model/db";

type Props = {
  companyUUID: string | null;
  jobUUID: string | null;
  onCancel: () => void;
  onConfirm: () => void;
};

const CoverLetterGeneratorModal: React.FC<Props> = ({ companyUUID, jobUUID, onCancel, onConfirm }) => {
  const db = useDB();

  const [company, setCompany] = useState<Company | null>(null);
  const [job, setJob] = useState<Job | null>(null);
  const [experiences, setExperiences] = useState<ReadonlyArray<Experience>>([]);
  const [templates, setTemplates] = useState<ReadonlyArray<Template>>([]);

  const [selectedExperienceUUIDs, setSelectedExperienceUUIDs] = useState<ReadonlyArray<string>>([]);
  const [selectedTemplateUUID, setSelectedTemplateUUID] = useState<string | null>(null);
  const [coverLetter, setCoverLetter] = useState<string | null>(null);


  const syncData = useCallback(
    async ()=>{
      if (db == null || jobUUID == null || companyUUID == null){
        return;
      }
      const { jobs, companies } = await db.read({ jobs: [jobUUID], companies: [companyUUID] });
      const allData = await db.listAll(["experiences", "templates"]);

      setJob(jobs?.[0] || null);
      setCompany(companies?.[0] || null);
      setExperiences(allData.experiences);
      setTemplates(allData.templates);
    },
    [db, jobUUID, companyUUID]
  );

  // Fetch data on modal open
  useEffect(
    () => {
      syncData();
    },
    [syncData]
  );

  // Generate the prompt based on selections
  const generatedPrompt = useMemo(
    () => {
      const selectedExperiences = experiences.filter((exp) =>
        selectedExperienceUUIDs.includes(exp.uuid)
      );
      const selectedTemplate = templates.find((tpl) => tpl.uuid === selectedTemplateUUID);

      const promptLines = [
          'I am applying for a job at a company. Please give me a cover latter based on the company, job description, my personal experience and generate something similar to the template.',
          `# Company Name: ${company?.name}`,
          `# Company Description:`,
          company?.description || "",
          '',
          `# Job Title: ${job?.title}`,
          '',
          '# Job Description:',
          job?.description || "",
          '',
          `# Selected Experiences:`,
          selectedExperiences.map((exp) => exp.content).join("\n"),
          '',
          `# Template:`,
          selectedTemplate?.content || ""
      ];
      const prompt = promptLines.join('\n');
      return prompt;
    },
    [experiences, selectedExperienceUUIDs, company, job, templates, selectedTemplateUUID]
  );

  const coverLetterDownloadHref = useMemo(
    ()=>textToBlobHref(coverLetter || ""),
    [coverLetter]
  );

  const handleConfirm = async () => {
    if (db == null || job == null || coverLetter == null) {
      return;
    }
    const updatedJob = {
      ...job,
      cover_letter: coverLetter,
    };
    try {
      await db.update({'jobs': [updatedJob]});
      setCoverLetter(null);
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
    setCoverLetter(null);
    onCancel();
  }

  return (
    <Modal show={jobUUID != null} onHide={handleCancel} size="lg" centered>
      <Modal.Header closeButton>
        <Modal.Title>
          {company?.name} - {job?.title}
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <section className="mb-4">
          <h5>1. Select Experiences</h5>
          {experiences.map((exp) => (
            <Form.Check
              key={exp.uuid}
              type="checkbox"
              label={exp.name}
              value={exp.uuid}
              checked={selectedExperienceUUIDs.includes(exp.uuid)}
              onChange={(e) => {
                setSelectedExperienceUUIDs((prev) =>
                  e.target.checked ? [...prev, exp.uuid] : prev.filter((id) => id !== exp.uuid)
                );
              }}
            />
          ))}
        </section>
        <section className="mb-4">
          <h5>2. Select Template</h5>
          {templates.map((tpl) => (
            <Form.Check
              key={tpl.uuid}
              type="radio"
              label={tpl.name}
              name="template"
              value={tpl.uuid}
              checked={selectedTemplateUUID === tpl.uuid}
              onChange={(e) => {
                if (e.target.checked){
                  setSelectedTemplateUUID(tpl.uuid);
                }
                else {
                  setSelectedTemplateUUID(null);
                }
              }}
            />
          ))}
        </section>
        <section className="mb-4">
          <h5>3. Generated Prompt</h5>
          <Form.Control
            as="textarea"
            rows={6}
            value={generatedPrompt}
          />
        </section>
        <section className="mb-4">
          <h5>4. Cover Letter</h5>
          <div className="d-flex mb-3">
            <Button
              variant="secondary"
              href={coverLetterDownloadHref}
            >
              Download
            </Button>
          </div>
          <Form.Control
            as="textarea"
            rows={6}
            value={coverLetter || job?.cover_letter || ""}
            onChange={(e) => setCoverLetter(e.target.value)}
          />
        </section>
      </Modal.Body>
      <Modal.Footer>
        <div className="d-flex w-100 justify-content-between">
          <Button variant="danger" onClick={handleCancel}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleConfirm}>
            Confirm
          </Button>
        </div>
        {(db == null || job == null) && <LoadingBlock />}
      </Modal.Footer>
    </Modal>
  );
};

export default CoverLetterGeneratorModal;
