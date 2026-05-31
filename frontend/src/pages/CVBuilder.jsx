import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api';
import jsPDF from 'jspdf';
import {
    createPdfContainer,
    escapeHtml,
    needsArabicPdf,
    removePdfContainer,
    saveElementAsPdf,
} from '../utils/pdfExport';
import {
    FileDown, Download, Sparkles, User, Briefcase,
    GraduationCap, Code, Award, Globe, Mail, Phone,
    MapPin, Linkedin, Github, Twitter, CheckCircle,
    Loader, Plus, Trash2, Edit2, Save, X, ChevronRight
} from 'lucide-react';
import { useTranslation } from 'react-i18next';

const CVBuilder = () => {
    const { t, i18n } = useTranslation();
    const { profile, goals, recommendations, user } = useAuth();
    const [generating, setGenerating] = useState(false);
    const [cvData, setCvData] = useState(null);
    const [editing, setEditing] = useState(false);
    const [editedData, setEditedData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [resetting, setResetting] = useState(false);

    useEffect(() => {
        const fetchCV = async () => {
            try {
                const response = await api.get('/cv');
                if (response.data && response.data.data) {
                    setCvData(response.data.data);
                    setEditedData(response.data.data);
                }
            } catch (err) {
                console.error("Failed to load CV:", err);
            } finally {
                setLoading(false);
            }
        };

        if (user) {
            fetchCV();
        } else {
            setLoading(false);
        }
    }, [user]);

    const recs = recommendations ? (() => {
        try { return JSON.parse(recommendations); }
        catch { return []; }
    })() : [];

    const completedGoals = goals?.filter(g => g.completed) || [];

    // Generate CV data from profile
    const generateCV = async () => {
        setGenerating(true);
        try {
            const response = await api.post('/cv/generate');
            if (response.data && response.data.data) {
                setCvData(response.data.data);
                setEditedData(response.data.data);
                setEditing(false);
            }
        } catch (error) {
            console.error("Failed to generate CV:", error);
            alert(t('An error occurred while generating your CV. Please try again.'));
        } finally {
            setGenerating(false);
        }
    };

    const updateCVField = (section, field, value) => {
        if (section === 'summary') {
            setEditedData({ ...editedData, summary: value });
        } else if (section === 'skills' && field === 'technical') {
            setEditedData({
                ...editedData,
                skills: { ...editedData.skills, technical: value }
            });
        } else if (section === 'skills' && field === 'soft') {
            setEditedData({
                ...editedData,
                skills: { ...editedData.skills, soft: value }
            });
        }
    };

    const addSkill = (type) => {
        const newSkill = prompt('Enter new skill:');
        if (newSkill && newSkill.trim()) {
            setEditedData({
                ...editedData,
                skills: {
                    ...editedData.skills,
                    [type]: [...editedData.skills[type], newSkill.trim()]
                }
            });
        }
    };

    const removeSkill = (type, index) => {
        const newSkills = [...editedData.skills[type]];
        newSkills.splice(index, 1);
        setEditedData({
            ...editedData,
            skills: {
                ...editedData.skills,
                [type]: newSkills
            }
        });
    };

    const buildCvPdfHtml = () => {
        const isRtl = i18n.language === 'ar';
        const align = isRtl ? 'right' : 'left';
        const name = profile?.name || 'Your Name';
        const title = recs[0]?.title || '';

        let contactInfo = [];
        if (profile?.location) contactInfo.push(profile.location);
        if (profile?.email) contactInfo.push(profile.email);
        const contactHtml = contactInfo.length > 0
            ? `<p style="margin:0 0 20px;font-size:12px;color:#666;">${escapeHtml(contactInfo.join(' | '))}</p>`
            : '<div style="margin-bottom:20px;"></div>';

        let html = `
            <div style="font-family:sans-serif;color:#000;">
                <h1 style="margin:0 0 5px;font-size:24px;">${escapeHtml(name)}</h1>
                ${title ? `<h2 style="margin:0 0 5px;font-size:16px;color:#333;">${escapeHtml(title)}</h2>` : ''}
                ${contactHtml}
        `;

        const addSection = (titleContent, bodyContent) => {
            html += `
                <h3 style="margin:0 0 5px;font-size:14px;text-transform:uppercase;border-bottom:1px solid #ccc;padding-bottom:5px;">${escapeHtml(titleContent)}</h3>
                <div style="margin-bottom:15px;">${bodyContent}</div>
            `;
        };

        if (cvData.summary) {
            addSection(t('Professional Summary'), `<p style="margin:0;font-size:12px;line-height:1.5;">${escapeHtml(cvData.summary)}</p>`);
        }

        if (cvData.skills?.technical?.length || cvData.skills?.soft?.length) {
            let skillsHtml = '';
            if (cvData.skills?.technical?.length) {
                skillsHtml += `<p style="margin:0 0 5px;font-size:12px;"><strong>${escapeHtml(t('Technical Skills'))}:</strong> ${escapeHtml(cvData.skills.technical.join(', '))}</p>`;
            }
            if (cvData.skills?.soft?.length) {
                skillsHtml += `<p style="margin:0;font-size:12px;"><strong>${escapeHtml(t('Soft Skills'))}:</strong> ${escapeHtml(cvData.skills.soft.join(', '))}</p>`;
            }
            addSection(t('Skills'), skillsHtml);
        }

        if (cvData.experience?.length > 0) {
            let expHtml = '';
            cvData.experience.forEach(exp => {
                expHtml += `
                    <div style="margin-bottom:10px;">
                        <div style="display:flex;justify-content:space-between;font-size:12px;font-weight:bold;margin-bottom:3px;">
                            <span>${escapeHtml(exp.title)} — ${escapeHtml(exp.company)}</span>
                            <span style="color:#666;">${escapeHtml(exp.duration || '')}</span>
                        </div>
                        <ul style="margin:0;padding-${align}:20px;font-size:12px;line-height:1.5;">
                            ${exp.points?.map(p => `<li>${escapeHtml(p)}</li>`).join('') || ''}
                        </ul>
                    </div>
                `;
            });
            addSection(t('Experience'), expHtml);
        }

        if (cvData.education?.length > 0) {
            let eduHtml = '';
            cvData.education.forEach(edu => {
                eduHtml += `
                    <div style="margin-bottom:10px;font-size:12px;line-height:1.5;">
                        <div style="display:flex;justify-content:space-between;font-weight:bold;">
                            <span>${escapeHtml(edu.degree)}</span>
                            <span style="color:#666;">${escapeHtml(edu.year || '')}</span>
                        </div>
                        <div>${escapeHtml(edu.institution || '')}</div>
                        ${edu.description ? `<div style="color:#666;">${escapeHtml(edu.description)}</div>` : ''}
                    </div>
                `;
            });
            addSection(t('Education'), eduHtml);
        }

        if (cvData.languages?.length > 0) {
            addSection(t('Languages'), `<p style="margin:0;font-size:12px;">${escapeHtml(cvData.languages.join(', '))}</p>`);
        }

        if (cvData.certifications?.length > 0) {
            addSection(t('Certifications'), `
                <ul style="margin:0;padding-${align}:20px;font-size:12px;line-height:1.5;">
                    ${cvData.certifications.map(c => `<li>${escapeHtml(c)}</li>`).join('')}
                </ul>
            `);
        }

        html += `</div>`;
        return html;
    };

    const downloadPDF = async () => {
        if (!cvData) return;

        const filename = `CV_${profile?.name?.replace(/\s+/g, '_') || 'Builder'}.pdf`;

        // Check if Arabic
        const allTexts = [
            profile?.name,
            profile?.location,
            cvData.summary,
            ...(cvData.skills?.technical || []),
            ...(cvData.skills?.soft || []),
            ...(cvData.experience?.map(e => e.title + e.company + e.duration + (e.points || []).join('')) || []),
            ...(cvData.education?.map(e => e.degree + e.institution + e.description) || []),
            ...(cvData.languages || []),
            ...(cvData.certifications || [])
        ];

        if (i18n.language === 'ar' || needsArabicPdf(...allTexts)) {
            const isRtl = i18n.language === 'ar' || needsArabicPdf(...allTexts);
            const container = createPdfContainer(isRtl ? 'rtl' : 'ltr');
            try {
                container.innerHTML = buildCvPdfHtml();
                await saveElementAsPdf(container, filename);
            } finally {
                removePdfContainer(container);
            }
            return;
        }

        // Native jsPDF for english
        const doc = new jsPDF({ orientation: 'p', unit: 'pt', format: 'a4' });
        let y = 40;

        // Header
        doc.setFontSize(24);
        doc.setFont('helvetica', 'bold');
        doc.text(profile?.name || 'Your Name', 40, y);
        y += 20;

        doc.setFontSize(12);
        doc.setFont('helvetica', 'normal');
        if (recs[0]?.title) {
            doc.text(recs[0].title, 40, y);
            y += 20;
        }

        const contactInfo = [];
        if (profile?.location) contactInfo.push(profile.location);
        if (profile?.email) contactInfo.push(profile.email);
        if (contactInfo.length) {
            doc.setFontSize(10);
            doc.setTextColor(100, 100, 100);
            doc.text(contactInfo.join(' | '), 40, y);
            y += 30;
        } else {
            y += 10;
        }
        doc.setTextColor(0, 0, 0);

        const addSectionTitle = (title) => {
            if (y > 750) { doc.addPage(); y = 40; }
            doc.setFontSize(14);
            doc.setFont('helvetica', 'bold');
            doc.text(title.toUpperCase(), 40, y);
            y += 5;
            doc.setLineWidth(0.5);
            doc.line(40, y, 550, y);
            y += 15;
        };

        if (cvData.summary) {
            addSectionTitle(t('Professional Summary'));
            doc.setFontSize(10);
            doc.setFont('helvetica', 'normal');
            const splitSummary = doc.splitTextToSize(cvData.summary, 510);
            doc.text(splitSummary, 40, y);
            y += (splitSummary.length * 12) + 15;
        }

        if (cvData.skills?.technical?.length || cvData.skills?.soft?.length) {
            addSectionTitle(t('Skills'));
            doc.setFontSize(10);
            const techSkills = cvData.skills?.technical?.join(', ') || '';
            const softSkills = cvData.skills?.soft?.join(', ') || '';
            if (techSkills) {
                doc.setFont('helvetica', 'bold');
                doc.text(t('Technical:'), 40, y);
                doc.setFont('helvetica', 'normal');
                const splitTech = doc.splitTextToSize(techSkills, 450);
                doc.text(splitTech, 100, y);
                y += (splitTech.length * 12) + 5;
            }
            if (softSkills) {
                doc.setFont('helvetica', 'bold');
                doc.text(t('Soft Skills:'), 40, y);
                doc.setFont('helvetica', 'normal');
                const splitSoft = doc.splitTextToSize(softSkills, 450);
                doc.text(splitSoft, 100, y);
                y += (splitSoft.length * 12) + 10;
            } else {
                y += 5;
            }
        }

        if (cvData.experience && cvData.experience.length > 0) {
            addSectionTitle(t('Experience'));
            cvData.experience.forEach(exp => {
                if (y > 750) { doc.addPage(); y = 40; }
                doc.setFontSize(11);
                doc.setFont('helvetica', 'bold');
                doc.text(`${exp.title} — ${exp.company}`, 40, y);
                doc.setFontSize(10);
                doc.setFont('helvetica', 'normal');
                doc.setTextColor(100, 100, 100);
                doc.text(exp.duration || '', 550, y, { align: 'right' });
                doc.setTextColor(0, 0, 0);
                y += 15;

                exp.points?.forEach(point => {
                    if (y > 780) { doc.addPage(); y = 40; }
                    const splitPoint = doc.splitTextToSize(`• ${point}`, 490);
                    doc.text(splitPoint, 50, y);
                    y += (splitPoint.length * 12) + 2;
                });
                y += 10;
            });
        }

        if (cvData.education && cvData.education.length > 0) {
            addSectionTitle(t('Education'));
            cvData.education.forEach(edu => {
                if (y > 750) { doc.addPage(); y = 40; }
                doc.setFontSize(11);
                doc.setFont('helvetica', 'bold');
                doc.text(edu.degree, 40, y);
                doc.setFontSize(10);
                doc.setFont('helvetica', 'normal');
                doc.setTextColor(100, 100, 100);
                doc.text(edu.year || '', 550, y, { align: 'right' });
                doc.setTextColor(0, 0, 0);
                y += 12;
                doc.text(edu.institution || '', 40, y);
                y += 12;
                if (edu.description) {
                    const splitDesc = doc.splitTextToSize(edu.description, 510);
                    doc.text(splitDesc, 40, y);
                    y += (splitDesc.length * 12) + 5;
                }
                y += 5;
            });
        }

        if (cvData.languages?.length > 0) {
            addSectionTitle(t('Languages'));
            doc.setFontSize(10);
            doc.setFont('helvetica', 'normal');
            const langStr = cvData.languages.join(', ');
            const splitLang = doc.splitTextToSize(langStr, 510);
            doc.text(splitLang, 40, y);
            y += (splitLang.length * 12) + 5;
        }

        if (cvData.certifications?.length > 0) {
            addSectionTitle(t('Certifications'));
            doc.setFontSize(10);
            doc.setFont('helvetica', 'normal');
            cvData.certifications.forEach(cert => {
                if (y > 780) { doc.addPage(); y = 40; }
                const splitCert = doc.splitTextToSize(`• ${cert}`, 510);
                doc.text(splitCert, 40, y);
                y += (splitCert.length * 12) + 2;
            });
        }

        doc.save(filename);
    };

    const resetCV = async () => {
        if (!cvData) return;
        const confirmed = window.confirm(
            t('This will delete your current CV so you can start fresh. Continue?')
        );
        if (!confirmed) return;

        setResetting(true);
        try {
            await api.delete('/cv');
            setCvData(null);
            setEditedData(null);
            setEditing(false);
        } catch (error) {
            console.error('Failed to reset CV:', error);
            alert(t('Failed to reset CV. Please try again.'));
        } finally {
            setResetting(false);
        }
    };

    const saveCV = async () => {
        try {
            const response = await api.put('/cv', editedData);
            if (response.data && response.data.data) {
                setCvData(response.data.data);
                setEditing(false);
            }
        } catch (error) {
            console.error("Failed to save CV:", error);
            alert(t('Failed to save changes.'));
        }
    };

    const profileComplete = () => {
        const checks = [
            !!profile?.name,
            !!profile?.education,
            !!profile?.skills,
            !!profile?.location,
            recs.length > 0,
            completedGoals.length > 0
        ];
        const completed = checks.filter(Boolean).length;
        return Math.round((completed / checks.length) * 100);
    };

    const completionPercentage = profileComplete();

    // If no user or loading, don't render (should be protected by route anyway)
    if (!user || loading) {
        return (
            <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8 flex items-center justify-center">
                <Loader size={48} className="animate-spin text-primary-600" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
            <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
                {/* Header */}
                <div className="mb-8">
                    <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 mb-3">
                        <a href="/dashboard" className="hover:text-primary-600">Dashboard</a>
                        <ChevronRight size={14} />
                        <span>CV Builder</span>
                    </div>
                    <div className="flex items-center justify-between flex-wrap gap-4">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2 flex items-center gap-2">
                                <FileDown size={28} className="text-primary-600" />
                                {t('CV Builder')}
                            </h1>
                            <p className="text-gray-600 dark:text-gray-400">{t('Create a professional CV from your profile data')}</p>
                        </div>
                        <div className="flex gap-3">
                            {!cvData ? (
                                <div className="tooltip-container">
                                    <button
                                        onClick={generateCV}
                                        disabled={generating}
                                        className="p-3.5 rounded-xl bg-gradient-to-r from-primary-600 to-secondary-600 text-white hover:scale-105 transition-transform disabled:opacity-50 flex items-center justify-center"
                                        aria-label="Generate CV"
                                    >
                                        {generating ? <Loader size={20} className="animate-spin" /> : <Sparkles size={20} />}
                                    </button>
                                    <span className="tooltip-text">{generating ? t('Generating...') : t('Generate CV')}</span>
                                </div>
                            ) : (
                                <>
                                    {editing ? (
                                        <>
                                            <div className="tooltip-container">
                                                <button
                                                    onClick={saveCV}
                                                    className="p-3.5 rounded-xl bg-green-600 hover:bg-green-700 text-white flex items-center justify-center"
                                                    aria-label="Save Changes"
                                                >
                                                    <Save size={20} />
                                                </button>
                                                <span className="tooltip-text">{t('Save Changes')}</span>
                                            </div>
                                            <div className="tooltip-container">
                                                <button
                                                    onClick={() => {
                                                        setEditing(false);
                                                        setEditedData(cvData);
                                                    }}
                                                    className="p-3.5 rounded-xl border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 flex items-center justify-center"
                                                    aria-label="Cancel editing"
                                                >
                                                    <X size={20} />
                                                </button>
                                                <span className="tooltip-text">{t('Cancel')}</span>
                                            </div>
                                        </>
                                    ) : (
                                        <>
                                            <div className="tooltip-container">
                                                <button
                                                    onClick={() => setEditing(true)}
                                                    className="p-3.5 rounded-xl border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 flex items-center justify-center"
                                                    aria-label="Edit CV"
                                                >
                                                    <Edit2 size={20} />
                                                </button>
                                                <span className="tooltip-text">{t('Edit CV')}</span>
                                            </div>
                                            <div className="tooltip-container">
                                                <button
                                                    onClick={downloadPDF}
                                                    className="p-3.5 rounded-xl bg-primary-600 hover:bg-primary-700 text-white flex items-center justify-center"
                                                    aria-label="Download CV as PDF"
                                                >
                                                    <Download size={20} />
                                                </button>
                                                <span className="tooltip-text">{t('Download PDF')}</span>
                                            </div>
                                            <div className="tooltip-container">
                                                <button
                                                    onClick={resetCV}
                                                    disabled={resetting}
                                                    className="p-3.5 rounded-xl border border-red-300 text-red-600 hover:bg-red-50 dark:border-red-700 dark:hover:bg-red-900/30 flex items-center justify-center disabled:opacity-50"
                                                    aria-label="Reset CV"
                                                >
                                                    {resetting ? (
                                                        <Loader size={20} className="animate-spin" />
                                                    ) : (
                                                        <Trash2 size={20} />
                                                    )}
                                                </button>
                                                <span className="tooltip-text">{resetting ? t('Resetting...') : t('Start Fresh / Reset CV')}</span>
                                            </div>
                                        </>
                                    )}
                                </>
                            )}
                        </div>
                    </div>
                </div>

                {/* Profile Completion Status */}
                {!cvData && !generating && (
                    <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 mb-6">
                        <h3 className="font-semibold text-gray-900 dark:text-white mb-3">{t('Profile Completion')}</h3>
                        <div className="flex items-center gap-4">
                            <div className="flex-1">
                                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                                    <div
                                        className="bg-gradient-to-r from-primary-600 to-secondary-600 h-2 rounded-full transition-all duration-500"
                                        style={{ width: `${completionPercentage}%` }}
                                    />
                                </div>
                            </div>
                            <span className="text-sm font-medium text-primary-600">{completionPercentage}%</span>
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mt-4">
                            {[
                                { label: t('Name'), done: !!profile?.name },
                                { label: t('Education'), done: !!profile?.education },
                                { label: t('Skills'), done: !!profile?.skills },
                                { label: t('Location'), done: !!profile?.location },
                                { label: t('Career Match'), done: recs.length > 0 },
                                { label: t('Goals Completed'), done: completedGoals.length > 0 }
                            ].map((item, i) => (
                                <div key={i} className="flex items-center gap-2 text-sm">
                                    {item.done ? (
                                        <CheckCircle size={14} className="text-green-500" />
                                    ) : (
                                        <div className="w-3.5 h-3.5 rounded-full border border-gray-300" />
                                    )}
                                    <span className={item.done ? 'text-gray-700 dark:text-gray-300' : 'text-gray-400'}>{item.label}</span>
                                </div>
                            ))}
                        </div>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-4">
                            Complete your profile and AI interview to generate a more detailed CV
                        </p>
                    </div>
                )}

                {/* Loading State */}
                {generating && (
                    <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-12 text-center">
                        <Loader size={48} className="animate-spin mx-auto text-primary-600 mb-4" />
                        <p className="text-gray-600 dark:text-gray-400 font-medium">AI is writing your CV...</p>
                        <p className="text-sm text-gray-500 dark:text-gray-500 mt-2">{t('Crafting your professional summary, skills, and experience')}</p>
                    </div>
                )}

                {/* CV Preview */}
                {cvData && !generating && editedData && (
                    <div id="cv-preview-content" className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden shadow-sm">
                        {/* CV Header */}
                        <div className="bg-gradient-to-r from-primary-600 to-secondary-600 p-8 text-white">
                            <h1 className="text-3xl font-bold">{profile?.name || 'Your Name'}</h1>
                            {recs[0]?.title && (
                                <p className="text-primary-100 mt-1">{recs[0].title}</p>
                            )}
                            <div className="flex flex-wrap gap-4 mt-4 text-sm text-primary-100">
                                {profile?.location && (
                                    <span className="flex items-center gap-1">
                                        <MapPin size={14} />
                                        {profile.location}
                                    </span>
                                )}
                                {profile?.email && (
                                    <span className="flex items-center gap-1">
                                        <Mail size={14} />
                                        {profile.email}
                                    </span>
                                )}
                            </div>
                        </div>

                        {/* CV Content */}
                        <div className="p-8 space-y-6">
                            {/* Summary */}
                            <div>
                                <h3 className="font-bold text-gray-700 dark:text-gray-300 uppercase text-xs tracking-wider mb-2 text-primary-600">
                                    Professional Summary
                                </h3>
                                <div className="border-t-2 border-primary-100 pt-3">
                                    {editing ? (
                                        <textarea
                                            value={editedData.summary}
                                            onChange={(e) => updateCVField('summary', null, e.target.value)}
                                            className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900"
                                            rows={3}
                                        />
                                    ) : (
                                        <p className="text-gray-700 dark:text-gray-300 leading-relaxed">{cvData.summary}</p>
                                    )}
                                </div>
                            </div>

                            {/* Skills */}
                            <div>
                                <h3 className="font-bold text-gray-700 dark:text-gray-300 uppercase text-xs tracking-wider mb-2 text-primary-600">
                                    Skills
                                </h3>
                                <div className="border-t-2 border-primary-100 pt-3 space-y-3">
                                    <div>
                                        <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">{t('Technical Skills')}</p>
                                        <div className="flex flex-wrap gap-2">
                                            {editedData.skills?.technical?.map((skill, i) => (
                                                <span key={i} className="bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 px-3 py-1 rounded-full text-sm flex items-center gap-1">
                                                    {skill}
                                                    {editing && (
                                                        <button onClick={() => removeSkill('technical', i)} className="hover:text-red-500">
                                                            <X size={12} />
                                                        </button>
                                                    )}
                                                </span>
                                            ))}
                                            {editing && (
                                                <button
                                                    onClick={() => addSkill('technical')}
                                                    className="bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 px-3 py-1 rounded-full text-sm flex items-center gap-1 hover:bg-gray-200"
                                                >
                                                    <Plus size={12} /> Add
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">{t('Soft Skills')}</p>
                                        <div className="flex flex-wrap gap-2">
                                            {editedData.skills?.soft?.map((skill, i) => (
                                                <span key={i} className="bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-300 px-3 py-1 rounded-full text-sm flex items-center gap-1">
                                                    {skill}
                                                    {editing && (
                                                        <button onClick={() => removeSkill('soft', i)} className="hover:text-red-500">
                                                            <X size={12} />
                                                        </button>
                                                    )}
                                                </span>
                                            ))}
                                            {editing && (
                                                <button
                                                    onClick={() => addSkill('soft')}
                                                    className="bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 px-3 py-1 rounded-full text-sm flex items-center gap-1 hover:bg-gray-200"
                                                >
                                                    <Plus size={12} /> Add
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Experience */}
                            <div>
                                <h3 className="font-bold text-gray-700 dark:text-gray-300 uppercase text-xs tracking-wider mb-2 text-primary-600">
                                    Experience
                                </h3>
                                <div className="border-t-2 border-primary-100 pt-3 space-y-4">
                                    {editedData.experience?.map((exp, idx) => (
                                        <div key={idx} className="border-b border-gray-200 dark:border-gray-700 pb-3 last:border-0">
                                            <div className="flex justify-between items-start flex-wrap gap-1">
                                                <p className="font-semibold text-gray-800 dark:text-white">{exp.title} — {exp.company}</p>
                                                <span className="text-xs text-gray-500">{exp.duration}</span>
                                            </div>
                                            <ul className="mt-2 space-y-1">
                                                {exp.points?.map((point, i) => (
                                                    <li key={i} className="text-sm text-gray-600 dark:text-gray-400 flex gap-2">
                                                        <span className="text-primary-400">•</span>
                                                        {point}
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Education */}
                            <div>
                                <h3 className="font-bold text-gray-700 dark:text-gray-300 uppercase text-xs tracking-wider mb-2 text-primary-600">
                                    Education
                                </h3>
                                <div className="border-t-2 border-primary-100 pt-3">
                                    {editedData.education?.map((edu, idx) => (
                                        <div key={idx}>
                                            <div className="flex justify-between flex-wrap gap-1">
                                                <p className="font-semibold text-gray-800 dark:text-white">{edu.degree}</p>
                                                <span className="text-sm text-gray-500">{edu.year}</span>
                                            </div>
                                            <p className="text-sm text-gray-600 dark:text-gray-400">{edu.institution}</p>
                                            {edu.description && (
                                                <p className="text-sm text-gray-500 mt-1">{edu.description}</p>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Languages & Certifications */}
                            <div className="grid md:grid-cols-2 gap-6">
                                <div>
                                    <h3 className="font-bold text-gray-700 dark:text-gray-300 uppercase text-xs tracking-wider mb-2 text-primary-600">
                                        Languages
                                    </h3>
                                    <div className="border-t-2 border-primary-100 pt-3">
                                        {editedData.languages?.map((lang, i) => (
                                            <p key={i} className="text-sm text-gray-700 dark:text-gray-300">{lang}</p>
                                        ))}
                                    </div>
                                </div>
                                <div>
                                    <h3 className="font-bold text-gray-700 dark:text-gray-300 uppercase text-xs tracking-wider mb-2 text-primary-600">
                                        Certifications
                                    </h3>
                                    <div className="border-t-2 border-primary-100 pt-3">
                                        {editedData.certifications?.map((cert, i) => (
                                            <p key={i} className="text-sm text-gray-700 dark:text-gray-300">{cert}</p>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default CVBuilder;