"use client";

import { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  FileText, 
  Download, 
  Eye, 
  Plus, 
  Trash2, 
  Edit,
  X,
  Award,
  Briefcase,
  GraduationCap,
  User
} from "lucide-react";
import { CVBuilderService, CVData, CV_TEMPLATES } from "@/lib/cvBuilderService";

interface ResumeBuilderProps {
  className?: string;
  userId?: string;
  onSave?: (cvData: CVData) => void;
  onGenerate?: (cvUrl: string) => void;
}

interface Experience {
  id: string;
  company: string;
  position: string;
  startDate: string;
  endDate: string;
  current: boolean;
  description: string;
}

interface Education {
  id: string;
  institution: string;
  degree: string;
  field: string;
  startDate: string;
  endDate: string;
  current: boolean;
}

interface Skill {
  id: string;
  name: string;
  level: number;
}

// Use the templates from the service
const resumeTemplates = CV_TEMPLATES;

export function ResumeBuilder({ className, userId, onSave, onGenerate }: ResumeBuilderProps) {
  const [selectedTemplate, setSelectedTemplate] = useState("modern");
  const [isEditing, setIsEditing] = useState(false);
  const [personalInfo, setPersonalInfo] = useState({
    fullName: "",
    title: "",
    email: "",
    phone: "",
    address: "",
    summary: "",
  });
  const [experiences, setExperiences] = useState<Experience[]>([]);
  const [educations, setEducations] = useState<Education[]>([]);
  const [skills, setSkills] = useState<Skill[]>([]);
  const [languages, setLanguages] = useState<Array<{ name: string; level: string }>>([]);
  const [projects, setProjects] = useState<Array<{ name: string; description: string; technologies: string[]; url?: string }>>([]);
  const [achievements, setAchievements] = useState<Array<{ title: string; description: string; date: string }>>([]);

  const loadCVData = useCallback(async () => {
    try {
      const cvData = await CVBuilderService.getCVData(userId!);
      if (cvData) {
        setPersonalInfo(cvData.personalInfo);
        setExperiences(cvData.experiences.map(exp => ({
          id: Date.now().toString() + Math.random(),
          ...exp
        })));
        setEducations(cvData.educations.map(edu => ({
          id: Date.now().toString() + Math.random(),
          ...edu
        })));
        setSkills(cvData.skills.map(skill => ({
          id: Date.now().toString() + Math.random(),
          ...skill
        })));
        setLanguages(cvData.languages || []);
        setProjects(cvData.projects || []);
        setAchievements(cvData.achievements || []);
      }
    } catch (error) {
      console.error("Error loading CV data:", error);
    }
  }, [userId]);

  // Load existing CV data
  useEffect(() => {
    if (userId) {
      loadCVData();
    }
  }, [userId, loadCVData]);

  const addExperience = () => {
    const newExperience: Experience = {
      id: Date.now().toString(),
      company: "",
      position: "",
      startDate: "",
      endDate: "",
      current: false,
      description: "",
    };
    setExperiences([...experiences, newExperience]);
  };

  const updateExperience = (id: string, field: keyof Experience, value: string | boolean) => {
    setExperiences(experiences.map(exp => 
      exp.id === id ? { ...exp, [field]: value } : exp
    ));
  };

  const removeExperience = (id: string) => {
    setExperiences(experiences.filter(exp => exp.id !== id));
  };

  const addEducation = () => {
    const newEducation: Education = {
      id: Date.now().toString(),
      institution: "",
      degree: "",
      field: "",
      startDate: "",
      endDate: "",
      current: false,
    };
    setEducations([...educations, newEducation]);
  };

  const updateEducation = (id: string, field: keyof Education, value: string | boolean) => {
    setEducations(educations.map(edu => 
      edu.id === id ? { ...edu, [field]: value } : edu
    ));
  };

  const removeEducation = (id: string) => {
    setEducations(educations.filter(edu => edu.id !== id));
  };

  const addSkill = () => {
    const newSkill: Skill = {
      id: Date.now().toString(),
      name: "",
      level: 1,
    };
    setSkills([...skills, newSkill]);
  };

  const updateSkill = (id: string, field: keyof Skill, value: string | number) => {
    setSkills(skills.map(skill => 
      skill.id === id ? { ...skill, [field]: value } : skill
    ));
  };

  const removeSkill = (id: string) => {
    setSkills(skills.filter(skill => skill.id !== id));
  };

  const generateResume = async () => {
    try {
      const cvData: CVData = {
        personalInfo,
        experiences,
        educations,
        skills,
        languages,
        projects,
        achievements
      };
      
      if (onSave) {
        onSave(cvData);
      }
      
      console.log("Generating resume...", cvData);
    } catch (error) {
      console.error("Error generating resume:", error);
    }
  };

  const previewResume = () => {
    const cvData: CVData = {
      personalInfo,
      experiences,
      educations,
      skills,
      languages,
      projects,
      achievements
    };
    
    // This would show a preview of the resume
    console.log("Previewing resume...", cvData);
  };

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Template Selection */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <FileText className="h-5 w-5 mr-2" />
            Plantillas de CV
          </CardTitle>
          <CardDescription>
            Selecciona una plantilla para tu currículum
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {resumeTemplates.map(template => (
              <div
                key={template.id}
                className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                  selectedTemplate === template.id
                    ? "border-primary bg-primary/5"
                    : "border-border hover:border-primary/50"
                }`}
                onClick={() => setSelectedTemplate(template.id)}
              >
                <h3 className="font-medium">{template.name}</h3>
                <p className="text-sm text-muted-foreground">{template.description}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Personal Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <User className="h-5 w-5 mr-2" />
            Información Personal
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <Label htmlFor="fullName">Nombre Completo</Label>
              <Input
                id="fullName"
                value={personalInfo.fullName}
                onChange={(e) => setPersonalInfo({...personalInfo, fullName: e.target.value})}
                disabled={!isEditing}
              />
            </div>
            <div>
              <Label htmlFor="title">Título Profesional</Label>
              <Input
                id="title"
                value={personalInfo.title}
                onChange={(e) => setPersonalInfo({...personalInfo, title: e.target.value})}
                disabled={!isEditing}
              />
            </div>
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={personalInfo.email}
                onChange={(e) => setPersonalInfo({...personalInfo, email: e.target.value})}
                disabled={!isEditing}
              />
            </div>
            <div>
              <Label htmlFor="phone">Teléfono</Label>
              <Input
                id="phone"
                value={personalInfo.phone}
                onChange={(e) => setPersonalInfo({...personalInfo, phone: e.target.value})}
                disabled={!isEditing}
              />
            </div>
          </div>
          <div>
            <Label htmlFor="address">Dirección</Label>
            <Input
              id="address"
              value={personalInfo.address}
              onChange={(e) => setPersonalInfo({...personalInfo, address: e.target.value})}
              disabled={!isEditing}
            />
          </div>
          <div>
            <Label htmlFor="summary">Resumen Profesional</Label>
            <Textarea
              id="summary"
              value={personalInfo.summary}
              onChange={(e) => setPersonalInfo({...personalInfo, summary: e.target.value})}
              disabled={!isEditing}
              rows={4}
              placeholder="Escribe un breve resumen de tu experiencia y objetivos profesionales..."
            />
          </div>
        </CardContent>
      </Card>

      {/* Experience */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center">
              <Briefcase className="h-5 w-5 mr-2" />
              Experiencia Laboral
            </CardTitle>
            <Button onClick={addExperience} size="sm">
              <Plus className="h-4 w-4 mr-2" />
              Agregar
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {experiences.map(experience => (
            <div key={experience.id} className="p-4 border rounded-lg space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="font-medium">Experiencia Laboral</h4>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => removeExperience(experience.id)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <Label>Empresa</Label>
                  <Input
                    value={experience.company}
                    onChange={(e) => updateExperience(experience.id, "company", e.target.value)}
                    disabled={!isEditing}
                  />
                </div>
                <div>
                  <Label>Posición</Label>
                  <Input
                    value={experience.position}
                    onChange={(e) => updateExperience(experience.id, "position", e.target.value)}
                    disabled={!isEditing}
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <Label>Fecha de Inicio</Label>
                  <Input
                    type="date"
                    value={experience.startDate}
                    onChange={(e) => updateExperience(experience.id, "startDate", e.target.value)}
                    disabled={!isEditing}
                  />
                </div>
                <div>
                  <Label>Fecha de Fin</Label>
                  <Input
                    type="date"
                    value={experience.endDate}
                    onChange={(e) => updateExperience(experience.id, "endDate", e.target.value)}
                    disabled={!isEditing || experience.current}
                  />
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id={`current-${experience.id}`}
                  checked={experience.current}
                  onChange={(e) => updateExperience(experience.id, "current", e.target.checked)}
                  disabled={!isEditing}
                />
                <Label htmlFor={`current-${experience.id}`}>Trabajo actual</Label>
              </div>
              <div>
                <Label>Descripción</Label>
                <Textarea
                  value={experience.description}
                  onChange={(e) => updateExperience(experience.id, "description", e.target.value)}
                  disabled={!isEditing}
                  rows={3}
                />
              </div>
            </div>
          ))}
          {experiences.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              No hay experiencias laborales agregadas
            </div>
          )}
        </CardContent>
      </Card>

      {/* Education */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center">
              <GraduationCap className="h-5 w-5 mr-2" />
              Educación
            </CardTitle>
            <Button onClick={addEducation} size="sm">
              <Plus className="h-4 w-4 mr-2" />
              Agregar
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {educations.map(education => (
            <div key={education.id} className="p-4 border rounded-lg space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="font-medium">Educación</h4>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => removeEducation(education.id)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <Label>Institución</Label>
                  <Input
                    value={education.institution}
                    onChange={(e) => updateEducation(education.id, "institution", e.target.value)}
                    disabled={!isEditing}
                  />
                </div>
                <div>
                  <Label>Título</Label>
                  <Input
                    value={education.degree}
                    onChange={(e) => updateEducation(education.id, "degree", e.target.value)}
                    disabled={!isEditing}
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <Label>Campo de Estudio</Label>
                  <Input
                    value={education.field}
                    onChange={(e) => updateEducation(education.id, "field", e.target.value)}
                    disabled={!isEditing}
                  />
                </div>
                <div>
                  <Label>Fecha de Inicio</Label>
                  <Input
                    type="date"
                    value={education.startDate}
                    onChange={(e) => updateEducation(education.id, "startDate", e.target.value)}
                    disabled={!isEditing}
                  />
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id={`current-edu-${education.id}`}
                  checked={education.current}
                  onChange={(e) => updateEducation(education.id, "current", e.target.checked)}
                  disabled={!isEditing}
                />
                <Label htmlFor={`current-edu-${education.id}`}>Estudiando actualmente</Label>
              </div>
            </div>
          ))}
          {educations.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              No hay educación agregada
            </div>
          )}
        </CardContent>
      </Card>

      {/* Skills */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center">
              <Award className="h-5 w-5 mr-2" />
              Habilidades
            </CardTitle>
            <Button onClick={addSkill} size="sm">
              <Plus className="h-4 w-4 mr-2" />
              Agregar
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {skills.map(skill => (
              <div key={skill.id} className="flex items-center space-x-2 p-2 border rounded-lg">
                <Input
                  value={skill.name}
                  onChange={(e) => updateSkill(skill.id, "name", e.target.value)}
                  disabled={!isEditing}
                  className="w-32"
                />
                <Select
                  value={skill.level.toString()}
                  onValueChange={(value) => updateSkill(skill.id, "level", parseInt(value))}
                  disabled={!isEditing}
                >
                  <SelectTrigger className="w-24">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">1</SelectItem>
                    <SelectItem value="2">2</SelectItem>
                    <SelectItem value="3">3</SelectItem>
                    <SelectItem value="4">4</SelectItem>
                    <SelectItem value="5">5</SelectItem>
                  </SelectContent>
                </Select>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => removeSkill(skill.id)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
          {skills.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              No hay habilidades agregadas
            </div>
          )}
        </CardContent>
      </Card>

      {/* Actions */}
      <div className="flex justify-between">
        <Button
          variant="outline"
          onClick={() => setIsEditing(!isEditing)}
        >
          <Edit className="h-4 w-4 mr-2" />
          {isEditing ? "Finalizar Edición" : "Editar CV"}
        </Button>
        <div className="space-x-2">
          <Button variant="outline" onClick={previewResume}>
            <Eye className="h-4 w-4 mr-2" />
            Vista Previa
          </Button>
          <Button onClick={generateResume}>
            <Download className="h-4 w-4 mr-2" />
            Generar PDF
          </Button>
        </div>
      </div>
    </div>
  );
}
