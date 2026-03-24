
"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';

export type Language = 'en' | 'vi' | 'es';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const translations: Record<Language, Record<string, string>> = {
  en: {
    dashboard: "Dashboard",
    testLibrary: "Test Library",
    students: "Students",
    results: "Results",
    activity: "Activity Logs",
    logout: "Log out",
    adminConsole: "Admin Console",
    statusActive: "Status: Active",
    lastSync: "Last Sync",
    accessKey: "Access Key",
    weeklySchedule: "Weekly Schedule",
    totalTests: "Total Tests",
    totalStudents: "Total Students",
    testResults: "Test Results",
    avgScore: "Avg. Score",
    activityTrend: "Activity Trend",
    recentResults: "Recent Results",
    seeAllResults: "See All Results",
    quickActions: "Quick Actions",
    createTest: "Create Test",
    manageTests: "Manage Tests",
    gsCode: "GS Code",
    syncData: "Sync Data",
    seedData: "Seed Library",
    searchTests: "Search tests...",
    newTest: "New Test",
    id: "ID",
    title: "Title",
    category: "Category",
    actions: "Actions",
    questions: "QUESTIONS",
    edit: "Edit",
    delete: "Delete",
    studentList: "Student List",
    addStudent: "Add Student",
    studentInfo: "Student Info",
    role: "Role",
    testsDone: "Tests Done",
    fullResultHistory: "Full Result History",
    date: "Date",
    student: "Student",
    email: "Email",
    score: "Score",
    result: "Result",
    passRate: "Pass Rate",
    excellent: "EXCELLENT",
    pass: "PASS",
    fail: "FAIL",
    saveChanges: "Save Changes",
    addMultiple: "Add Multiple",
    studentManagement: "Student Management",
    questionList: "Question List",
    manageQuestions: "Manage the questions for this test",
    recentSubmissions: "Latest student submissions",
    weeklyKeys: "Keys change automatically at midnight.",
    noTests: "No Tests Found",
    noStudents: "No students registered",
    noResults: "No results yet",
    waitingFirst: "Waiting for the first student submission...",
    confirmDeleteTitle: "Are you sure?",
    confirmDeleteDesc: "This will permanently remove this item and all its associated data. This action cannot be undone.",
    cancel: "Cancel",
    timestamp: "Timestamp",
    event: "Event",
    systemActivity: "System Activity Logs",
    monitorAccess: "Monitor student login/logout events"
  },
  vi: {
    dashboard: "Bảng điều khiển",
    testLibrary: "Thư viện bài thi",
    students: "Học sinh",
    results: "Kết quả",
    activity: "Lịch sử hoạt động",
    logout: "Đăng xuất",
    adminConsole: "Quản trị",
    statusActive: "Trạng thái: Hoạt động",
    lastSync: "Đồng bộ cuối",
    accessKey: "Mã truy cập",
    weeklySchedule: "Lịch hàng tuần",
    totalTests: "Tổng bài thi",
    totalStudents: "Tổng học sinh",
    testResults: "Kết quả thi",
    avgScore: "Điểm trung bình",
    activityTrend: "Xu hướng hoạt động",
    recentResults: "Kết quả gần đây",
    seeAllResults: "Xem tất cả",
    quickActions: "Thao tác nhanh",
    createTest: "Tạo bài thi",
    manageTests: "Quản lý bài thi",
    gsCode: "Mã GS",
    syncData: "Đồng bộ dữ liệu",
    seedData: "Nạp dữ liệu mẫu",
    searchTests: "Tìm kiếm bài thi...",
    newTest: "Bài thi mới",
    id: "ID",
    title: "Tiêu đề",
    category: "Danh mục",
    actions: "Hành động",
    questions: "CÂU HỎI",
    edit: "Sửa",
    delete: "Xóa",
    studentList: "Danh sách học sinh",
    addStudent: "Thêm học sinh",
    studentInfo: "Thông tin học sinh",
    role: "Vai trò",
    testsDone: "Bài đã làm",
    fullResultHistory: "Lịch sử kết quả",
    date: "Ngày",
    student: "Học sinh",
    email: "Email",
    score: "Điểm số",
    result: "Kết quả",
    passRate: "Tỷ lệ đạt",
    excellent: "XUẤT SẮC",
    pass: "ĐẠT",
    fail: "KHÔNG ĐẠT",
    saveChanges: "Lưu thay đổi",
    addMultiple: "Thêm nhiều học sinh",
    studentManagement: "Quản lý học sinh",
    questionList: "Danh sách câu hỏi",
    manageQuestions: "Quản lý câu hỏi cho bài thi này",
    recentSubmissions: "Các bài nộp mới nhất",
    weeklyKeys: "Mã thay đổi tự động vào nửa đêm.",
    noTests: "Không tìm thấy bài thi nào",
    noStudents: "Chưa có học sinh đăng ký",
    noResults: "Chưa có kết quả",
    waitingFirst: "Đang chờ bài nộp đầu tiên từ học sinh...",
    confirmDeleteTitle: "Bạn có chắc chắn không?",
    confirmDeleteDesc: "Thao tác này sẽ xóa vĩnh viễn mục này và tất cả dữ liệu liên quan. Hành động này không thể hoàn tác.",
    cancel: "Hủy",
    timestamp: "Thời gian",
    event: "Sự kiện",
    systemActivity: "Nhật ký hệ thống",
    monitorAccess: "Theo dõi đăng nhập/đăng xuất của học sinh"
  },
  es: {
    dashboard: "Panel",
    testLibrary: "Biblioteca de pruebas",
    students: "Estudiantes",
    results: "Resultados",
    activity: "Registro de actividad",
    logout: "Cerrar sesión",
    adminConsole: "Panel de control",
    statusActive: "Estado: Activo",
    lastSync: "Última sincronización",
    accessKey: "Clave de acceso",
    weeklySchedule: "Horario semanal",
    totalTests: "Total de pruebas",
    totalStudents: "Total de estudiantes",
    testResults: "Resultados de pruebas",
    avgScore: "Puntuación media",
    activityTrend: "Tendencia de actividad",
    recentResults: "Resultados recientes",
    seeAllResults: "Ver todos",
    quickActions: "Acciones rápidas",
    createTest: "Crear prueba",
    manageTests: "Gestionar pruebas",
    gsCode: "Código GS",
    syncData: "Sincronizar datos",
    seedData: "Cargar datos iniciales",
    searchTests: "Buscar pruebas...",
    newTest: "Nueva prueba",
    id: "ID",
    title: "Título",
    category: "Categoría",
    actions: "Acciones",
    questions: "PREGUNTAS",
    edit: "Editar",
    delete: "Eliminar",
    studentList: "Lista de estudiantes",
    addStudent: "Agregar estudiante",
    studentInfo: "Información del estudiante",
    role: "Rol",
    testsDone: "Pruebas realizadas",
    fullResultHistory: "Historial de resultados",
    date: "Fecha",
    student: "Estudiante",
    email: "Email",
    score: "Puntuación",
    result: "Resultado",
    passRate: "Tasa de aprobación",
    excellent: "EXCELENTE",
    pass: "APROBADO",
    fail: "REPROBADO",
    saveChanges: "Guardar cambios",
    addMultiple: "Agregar varios",
    studentManagement: "Gestión de Estudiantes",
    questionList: "Lista de Preguntas",
    manageQuestions: "Gestionar las preguntas de esta prueba",
    recentSubmissions: "Últimas entregas de estudiantes",
    weeklyKeys: "Las claves cambian automáticamente a medianoche.",
    noTests: "No se encontraron pruebas",
    noStudents: "No hay estudiantes registrados",
    noResults: "Aún no hay resultados",
    waitingFirst: "Esperando la primera entrega del estudiante...",
    confirmDeleteTitle: "¿Estás seguro?",
    confirmDeleteDesc: "Esto eliminará permanentemente este elemento y todos sus datos asociados. Esta acción no se puede deshacer.",
    cancel: "Cancelar",
    timestamp: "Fecha y hora",
    event: "Evento",
    systemActivity: "Registros de actividad",
    monitorAccess: "Monitorear eventos de inicio y cierre de sesión"
  }
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguage] = useState<Language>('en');

  useEffect(() => {
    const saved = localStorage.getItem('dntrng_admin_lang') as Language;
    if (saved && (saved === 'en' || saved === 'vi' || saved === 'es')) {
      setLanguage(saved);
    }
  }, []);

  const handleSetLanguage = (lang: Language) => {
    setLanguage(lang);
    localStorage.setItem('dntrng_admin_lang', lang);
  };

  const t = (key: string) => {
    return translations[language][key] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage: handleSetLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}
