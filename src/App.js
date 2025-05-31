import React, { useState, useEffect } from 'react';
import { Plus, Target, TrendingUp, Calendar, Users, Edit3, Trash2, Save, X, Award, BarChart3, LogOut, User, Lock, Home, FileText, Settings, PieChart, Menu } from 'lucide-react';

// Firebase imports
import { db } from './firebase';
import { 
  collection, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc, 
  onSnapshot 
} from 'firebase/firestore';

const OKRIGS = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [currentUser, setCurrentUser] = useState('');
  const [loginData, setLoginData] = useState({ username: '', password: '' });
  const [okrs, setOkrs] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingOkr, setEditingOkr] = useState(null);
  const [selectedQuarter, setSelectedQuarter] = useState('السنة كاملة');
  const [activeTab, setActiveTab] = useState('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(true);

  // Check if user was logged in
  useEffect(() => {
    const savedUser = localStorage.getItem('currentUser');
    const savedLoginStatus = localStorage.getItem('isLoggedIn');
    
    if (savedUser && savedLoginStatus === 'true') {
      setIsLoggedIn(true);
      setCurrentUser(savedUser);
    }
  }, []);

  // Load data from Firebase
  useEffect(() => {
    if (isLoggedIn) {
      const unsubscribe = onSnapshot(collection(db, 'okrs'), (snapshot) => {
        const okrsData = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        
        // لو مفيش بيانات، حط البيانات التجريبية
        if (okrsData.length === 0) {
          const sampleOkrs = [
            {
              objective: "زيادة رضا العملاء وتحسين جودة الخدمة",
              quarter: "Q1 2025",
              owner: "فريق خدمة العملاء",
              status: "في التقدم",
              progress: 75,
              keyResults: [
                { id: 1, description: "تحقيق معدل رضا عملاء 95%", target: 95, current: 88, unit: "%" },
                { id: 2, description: "تقليل وقت الاستجابة إلى 2 ساعة", target: 2, current: 3.2, unit: "ساعة" },
                { id: 3, description: "زيادة عدد المراجعات الإيجابية بنسبة 50%", target: 150, current: 120, unit: "مراجعة" }
              ]
            },
            {
              objective: "تطوير المنتجات وزيادة الإيرادات",
              quarter: "Q1 2025",
              owner: "فريق التطوير",
              status: "في التقدم",
              progress: 60,
              keyResults: [
                { id: 1, description: "إطلاق 3 ميزات جديدة", target: 3, current: 2, unit: "ميزة" },
                { id: 2, description: "زيادة الإيرادات بنسبة 25%", target: 25, current: 18, unit: "%" },
                { id: 3, description: "تحسين سرعة التطبيق بنسبة 40%", target: 40, current: 25, unit: "%" }
              ]
            }
          ];
          
          // حفظ البيانات التجريبية في Firebase
          sampleOkrs.forEach(okr => {
            addDoc(collection(db, 'okrs'), okr);
          });
        } else {
          setOkrs(okrsData);
        }
      });

      return () => unsubscribe();
    }
  }, [isLoggedIn]);

  const [formData, setFormData] = useState({
    objective: '',
    quarter: 'Q1 2025',
    owner: '',
    keyResults: [{ description: '', target: '', unit: '' }]
  });

const quarters = ['السنة كاملة', 'Q1 2025', 'Q2 2025', 'Q3 2025', 'Q4 2025'];

  // Sample users for demo
  const users = [
    { username: 'admin', password: '123456', name: 'المدير العام' },
    { username: 'manager', password: '123456', name: 'مدير المشروع' },
    { username: 'team', password: '123456', name: 'عضو الفريق' }
  ];

  // Sidebar menu items
  const menuItems = [
    { id: 'dashboard', name: 'لوحة التحكم', icon: Home },
    { id: 'profile', name: 'بيانات المستخدم', icon: User },
    { id: 'reports', name: 'التقارير', icon: FileText },
    { id: 'analytics', name: 'الإحصائيات', icon: PieChart },
    { id: 'settings', name: 'الإعدادات', icon: Settings }
  ];

  const handleLogin = () => {
    const user = users.find(u => u.username === loginData.username && u.password === loginData.password);
    if (user) {
      setIsLoggedIn(true);
      setCurrentUser(user.name);
      
      // Save to localStorage
      localStorage.setItem('isLoggedIn', 'true');
      localStorage.setItem('currentUser', user.name);
      
      setLoginData({ username: '', password: '' });
    } else {
      alert('اسم المستخدم أو كلمة المرور غير صحيحة');
    }
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setCurrentUser('');
    setLoginData({ username: '', password: '' });
    
    // Clear localStorage
    localStorage.removeItem('isLoggedIn');
    localStorage.removeItem('currentUser');
  };

  const addKeyResult = () => {
    setFormData({
      ...formData,
      keyResults: [...formData.keyResults, { description: '', target: '', unit: '' }]
    });
  };

  const updateKeyResult = (index, field, value) => {
    const updatedKeyResults = formData.keyResults.map((kr, i) =>
      i === index ? { ...kr, [field]: value } : kr
    );
    setFormData({ ...formData, keyResults: updatedKeyResults });
  };

  const removeKeyResult = (index) => {
    setFormData({
      ...formData,
      keyResults: formData.keyResults.filter((_, i) => i !== index)
    });
  };

  const handleSubmit = async () => {
    if (!formData.objective || !formData.owner || formData.keyResults.some(kr => !kr.description || !kr.target)) {
      alert('يرجى ملء جميع الحقول المطلوبة');
      return;
    }

    const newOkr = {
      ...formData,
      status: editingOkr ? editingOkr.status : "جديد",
      progress: editingOkr ? editingOkr.progress : 0,
      keyResults: formData.keyResults.map((kr, index) => ({
        id: index + 1,
        ...kr,
        current: editingOkr ? editingOkr.keyResults[index]?.current || 0 : 0,
        target: parseFloat(kr.target)
      }))
    };

    try {
      if (editingOkr) {
        await updateDoc(doc(db, 'okrs', editingOkr.id), newOkr);
      } else {
        await addDoc(collection(db, 'okrs'), newOkr);
      }
      resetForm();
    } catch (error) {
      console.error('Error saving OKR:', error);
      alert('حدث خطأ في حفظ البيانات');
    }
  };

  const resetForm = () => {
    setFormData({
      objective: '',
      quarter: 'Q1 2025',
      owner: '',
      keyResults: [{ description: '', target: '', unit: '' }]
    });
    setShowForm(false);
    setEditingOkr(null);
  };

  const editOkr = (okr) => {
    setEditingOkr(okr);
    setFormData({
      objective: okr.objective,
      quarter: okr.quarter,
      owner: okr.owner,
      keyResults: okr.keyResults.map(kr => ({
        description: kr.description,
        target: kr.target.toString(),
        unit: kr.unit
      }))
    });
    setShowForm(true);
  };

  const deleteOkr = async (id) => {
    if (window.confirm('هل أنت متأكد من حذف هذا الهدف؟')) {
      try {
        await deleteDoc(doc(db, 'okrs', id));
      } catch (error) {
        console.error('Error deleting OKR:', error);
        alert('حدث خطأ في حذف الهدف');
      }
    }
  };

  const updateProgress = async (okrId, krId, value) => {
    try {
      const okr = okrs.find(o => o.id === okrId);
      if (!okr) return;

      const updatedKeyResults = okr.keyResults.map(kr =>
        kr.id === krId ? { ...kr, current: parseFloat(value) || 0 } : kr
      );

      const totalProgress = updatedKeyResults.reduce((sum, kr) => {
        const progress = Math.min((kr.current / kr.target) * 100, 100);
        return sum + progress;
      }, 0);
      const overallProgress = Math.round(totalProgress / updatedKeyResults.length);

      const updatedOkr = {
        ...okr,
        keyResults: updatedKeyResults,
        progress: overallProgress,
        status: overallProgress === 100 ? "مكتمل" : overallProgress > 0 ? "في التقدم" : "جديد"
      };

      await updateDoc(doc(db, 'okrs', okrId), updatedOkr);
    } catch (error) {
      console.error('Error updating progress:', error);
      alert('حدث خطأ في تحديث التقدم');
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'مكتمل': return 'bg-green-100 text-green-800';
      case 'في التقدم': return 'bg-blue-100 text-blue-800';
      case 'متأخر': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getProgressColor = (progress) => {
    if (progress >= 80) return 'bg-green-500';
    if (progress >= 50) return 'bg-blue-500';
    if (progress >= 25) return 'bg-yellow-500';
    return 'bg-red-500';
  };

 const filteredOkrs = selectedQuarter === 'السنة كاملة' 
  ? okrs 
  : okrs.filter(okr => okr.quarter === selectedQuarter);

  const overallStats = {
    totalOkrs: filteredOkrs.length,
    completed: filteredOkrs.filter(okr => okr.status === 'مكتمل').length,
    inProgress: filteredOkrs.filter(okr => okr.status === 'في التقدم').length,
    averageProgress: filteredOkrs.length > 0 
      ? Math.round(filteredOkrs.reduce((sum, okr) => sum + okr.progress, 0) / filteredOkrs.length)
      : 0
  };
  // إضافة إحصائيات جديدة للسنة
  quarterlyBreakdown: selectedQuarter === 'السنة كاملة' ? {
    Q1: okrs.filter(okr => okr.quarter === 'Q1 2025'),
    Q2: okrs.filter(okr => okr.quarter === 'Q2 2025'),
    Q3: okrs.filter(okr => okr.quarter === 'Q3 2025'),
    Q4: okrs.filter(okr => okr.quarter === 'Q4 2025')
  } : null

  // Login Screen
  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center" dir="rtl">
        <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-md">
          <div className="text-center mb-6">
            <Target className="h-12 w-12 text-blue-600 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-gray-900">نظام إدارة OKR</h1>
            <p className="text-gray-600 mt-2">يرجى تسجيل الدخول للمتابعة</p>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                اسم المستخدم
              </label>
              <div className="relative">
                <User className="absolute right-3 top-3 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  value={loginData.username}
                  onChange={(e) => setLoginData({ ...loginData, username: e.target.value })}
                  className="w-full pr-10 pl-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="أدخل اسم المستخدم"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                كلمة المرور
              </label>
              <div className="relative">
                <Lock className="absolute right-3 top-3 h-5 w-5 text-gray-400" />
                <input
                  type="password"
                  value={loginData.password}
                  onChange={(e) => setLoginData({ ...loginData, password: e.target.value })}
                  className="w-full pr-10 pl-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="أدخل كلمة المرور"
                  onKeyPress={(e) => e.key === 'Enter' && handleLogin()}
                />
              </div>
            </div>

            <button
              onClick={handleLogin}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg font-medium transition-colors"
            >
              تسجيل الدخول
            </button>

            <div className="mt-4 p-3 bg-blue-50 rounded-lg">
              <p className="text-sm text-blue-800 font-medium mb-2">بيانات تجريبية:</p>
              <div className="text-xs text-blue-700 space-y-1">
                <div>admin / 123456 (المدير العام)</div>
                <div>manager / 123456 (مدير المشروع)</div>
                <div>team / 123456 (عضو الفريق)</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // انسخ باقي الكود من الجزء الثاني
  // PART 2 GOES HERE - نكمل في الملف التاني
  
  // استبدل "return null;" في الجزء الأول بهذا الكود:

// استبدل "return null;" في الجزء الأول بهذا الكود:

  // Render different content based on active tab
  const renderContent = () => {
    switch (activeTab) {
      case 'profile':
        return (
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">بيانات المستخدم</h2>
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
                  <User className="h-8 w-8 text-blue-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">{currentUser}</h3>
                  <p className="text-gray-600">مستخدم نشط في النظام</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4 mt-6">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-600">الأهداف المكتملة</p>
                  <p className="text-2xl font-bold text-green-600">{overallStats.completed}</p>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-600">الأهداف النشطة</p>
                  <p className="text-2xl font-bold text-blue-600">{overallStats.inProgress}</p>
                </div>
              </div>
            </div>
          </div>
        );

      case 'reports':
        return (
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">التقارير</h2>
            <div className="space-y-4">
              <div className="border border-gray-200 rounded-lg p-4">
                <h3 className="font-semibold mb-2">تقرير الأداء الشهري</h3>
                <p className="text-gray-600 text-sm">متوسط التقدم: {overallStats.averageProgress}%</p>
                <div className="mt-2 w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-blue-600 h-2 rounded-full" 
                    style={{width: `${overallStats.averageProgress}%`}}
                  ></div>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div className="bg-green-50 p-4 rounded-lg text-center">
                  <p className="text-green-800 font-semibold">{overallStats.completed}</p>
                  <p className="text-green-600 text-sm">مكتمل</p>
                </div>
                <div className="bg-blue-50 p-4 rounded-lg text-center">
                  <p className="text-blue-800 font-semibold">{overallStats.inProgress}</p>
                  <p className="text-blue-600 text-sm">في التقدم</p>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg text-center">
                  <p className="text-gray-800 font-semibold">{overallStats.totalOkrs}</p>
                  <p className="text-gray-600 text-sm">إجمالي</p>
                </div>
              </div>
            </div>
          </div>
        );

      case 'analytics':
        return (
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">الإحصائيات</h2>
            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-4">
                <h3 className="font-semibold">معدل الإنجاز</h3>
                <div className="space-y-2">
                  {quarters.map(quarter => {
                    const quarterOkrs = okrs.filter(okr => okr.quarter === quarter);
                    const avgProgress = quarterOkrs.length > 0 
                      ? quarterOkrs.reduce((sum, okr) => sum + okr.progress, 0) / quarterOkrs.length 
                      : 0;
                    return (
                      <div key={quarter} className="flex items-center justify-between">
                        <span className="text-sm">{quarter}</span>
                        <div className="flex items-center gap-2">
                          <div className="w-20 bg-gray-200 rounded-full h-2">
                            <div 
                              className="bg-blue-600 h-2 rounded-full" 
                              style={{width: `${avgProgress}%`}}
                            ></div>
                          </div>
                          <span className="text-sm font-medium w-10">{Math.round(avgProgress)}%</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
              <div className="space-y-4">
                <h3 className="font-semibold">توزيع الحالات</h3>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">مكتمل</span>
                    <span className="bg-green-100 text-green-800 px-2 py-1 rounded text-sm">
                      {Math.round((overallStats.completed / overallStats.totalOkrs) * 100) || 0}%
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">في التقدم</span>
                    <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-sm">
                      {Math.round((overallStats.inProgress / overallStats.totalOkrs) * 100) || 0}%
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );

      case 'settings':
        return (
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">الإعدادات</h2>
            <div className="space-y-4">
              <div className="border-b pb-4">
                <h3 className="font-semibold mb-2">إعدادات عامة</h3>
                <div className="space-y-2">
                  <label className="flex items-center gap-2">
                    <input type="checkbox" className="rounded" />
                    <span className="text-sm">تفعيل الإشعارات</span>
                  </label>
                  <label className="flex items-center gap-2">
                    <input type="checkbox" className="rounded" defaultChecked />
                    <span className="text-sm">حفظ تلقائي للبيانات</span>
                  </label>
                </div>
              </div>
              <div className="border-b pb-4">
                <h3 className="font-semibold mb-2">إعدادات العرض</h3>
                <div className="space-y-2">
                  <label className="flex items-center gap-2">
                    <input type="checkbox" className="rounded" defaultChecked />
                    <span className="text-sm">عرض الإحصائيات في الرئيسية</span>
                  </label>
                  <label className="flex items-center gap-2">
                    <input type="checkbox" className="rounded" />
                    <span className="text-sm">الوضع المظلم</span>
                  </label>
                </div>
              </div>
              <div>
                <h3 className="font-semibold mb-2">إدارة البيانات</h3>
                <div className="space-y-2">
                  <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm">
                    تصدير البيانات
                  </button>
                  <button className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg text-sm mr-2">
                    مسح جميع البيانات
                  </button>
                </div>
              </div>
            </div>
          </div>
        );

      default: // dashboard
        return (
          <>
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
              <div className="bg-white p-6 rounded-lg shadow-sm">
                <div className="flex items-center gap-3">
                  <Target className="h-8 w-8 text-blue-600" />
                  <div>
                    <p className="text-sm text-gray-600">إجمالي الأهداف</p>
                    <p className="text-2xl font-bold text-gray-900">{overallStats.totalOkrs}</p>
                  </div>
                </div>
              </div>
              
              <div className="bg-white p-6 rounded-lg shadow-sm">
                <div className="flex items-center gap-3">
                  <Award className="h-8 w-8 text-green-600" />
                  <div>
                    <p className="text-sm text-gray-600">الأهداف المكتملة</p>
                    <p className="text-2xl font-bold text-gray-900">{overallStats.completed}</p>
                  </div>
                </div>
              </div>
              
              <div className="bg-white p-6 rounded-lg shadow-sm">
                <div className="flex items-center gap-3">
                  <TrendingUp className="h-8 w-8 text-yellow-600" />
                  <div>
                    <p className="text-sm text-gray-600">قيد التنفيذ</p>
                    <p className="text-2xl font-bold text-gray-900">{overallStats.inProgress}</p>
                  </div>
                </div>
              </div>
              
              <div className="bg-white p-6 rounded-lg shadow-sm">
                <div className="flex items-center gap-3">
                  <BarChart3 className="h-8 w-8 text-purple-600" />
                  <div>
                    <p className="text-sm text-gray-600">متوسط التقدم</p>
                    <p className="text-2xl font-bold text-gray-900">{overallStats.averageProgress}%</p>
                  </div>
                </div>
              </div>
            </div>

            {/* OKR List */}
            <div className="space-y-6">
              {filteredOkrs.length === 0 ? (
                <div className="bg-white rounded-lg shadow-sm p-12 text-center">
                  <Target className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">لا توجد أهداف لهذا الربع</h3>
                  <p className="text-gray-600 mb-4">ابدأ بإضافة هدف جديد لتتبع التقدم</p>
                  <button
                    onClick={() => setShowForm(true)}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg"
                  >
                    إضافة هدف جديد
                  </button>
                </div>
              ) : (
                filteredOkrs.map((okr) => (
                  <div key={okr.id} className="bg-white rounded-lg shadow-sm p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">
                          {okr.objective}
                        </h3>
                        <div className="flex items-center gap-4 text-sm text-gray-600 mb-3">
                          <span className="flex items-center gap-1">
                            <Calendar className="h-4 w-4" />
                            {okr.quarter}
                          </span>
                          <span className="flex items-center gap-1">
                            <Users className="h-4 w-4" />
                            {okr.owner}
                          </span>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(okr.status)}`}>
                            {okr.status}
                          </span>
                        </div>
                        
                        <div className="flex items-center gap-3 mb-4">
                          <div className="flex-1 bg-gray-200 rounded-full h-2">
                            <div
                              className={`h-2 rounded-full transition-all duration-300 ${getProgressColor(okr.progress)}`}
                              style={{ width: `${okr.progress}%` }}
                            ></div>
                          </div>
                          <span className="text-sm font-medium text-gray-600">{okr.progress}%</span>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => editOkr(okr)}
                          className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded"
                        >
                          <Edit3 className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => deleteOkr(okr.id)}
                          className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>

                    {/* Key Results */}
                    <div className="space-y-3">
                      <h4 className="font-medium text-gray-900">النتائج الرئيسية:</h4>
                      {okr.keyResults.map((kr) => {
                        const progress = Math.min((kr.current / kr.target) * 100, 100);
                        return (
                          <div key={kr.id} className="bg-gray-50 rounded-lg p-4">
                            <div className="flex items-center justify-between mb-2">
                              <p className="text-sm font-medium text-gray-900">{kr.description}</p>
                              <span className="text-sm text-gray-600">
                                {kr.current} / {kr.target} {kr.unit}
                              </span>
                            </div>
                            
                            <div className="flex items-center gap-3">
                              <div className="flex-1 bg-gray-200 rounded-full h-1.5">
                                <div
                                  className={`h-1.5 rounded-full transition-all duration-300 ${
                                    progress >= 100 ? 'bg-green-500' : 
                                    progress >= 75 ? 'bg-blue-500' : 
                                    progress >= 50 ? 'bg-yellow-500' : 'bg-red-500'
                                  }`}
                                  style={{ width: `${progress}%` }}
                                ></div>
                              </div>
                              <span className="text-xs text-gray-600">{Math.round(progress)}%</span>
                              <input
                                type="number"
                                value={kr.current}
                                onChange={(e) => updateProgress(okr.id, kr.id, e.target.value)}
                                className="w-16 px-2 py-1 text-xs border border-gray-300 rounded focus:ring-1 focus:ring-blue-500"
                                step="0.1"
                                min="0"
                              />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))
              )}
            </div>
          </>
        );
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex" dir="rtl">
      {/* Sidebar */}
      <div className={`${sidebarOpen ? 'w-64' : 'w-16'} transition-all duration-300 bg-white shadow-lg flex flex-col`}>
        {/* Sidebar Header */}
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <Target className="h-8 w-8 text-blue-600 flex-shrink-0" />
            {sidebarOpen && (
              <div>
                <h1 className="text-lg font-bold text-gray-900">نظام OKR</h1>
                <p className="text-xs text-gray-600">{currentUser}</p>
              </div>
            )}
          </div>
        </div>

        {/* Menu Items */}
        <nav className="flex-1 p-4">
          <ul className="space-y-2">
            {menuItems.map((item) => {
              const Icon = item.icon;
              return (
                <li key={item.id}>
                  <button
                    onClick={() => setActiveTab(item.id)}
                    className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-right transition-colors ${
                      activeTab === item.id
                        ? 'bg-blue-100 text-blue-700 border-r-2 border-blue-600'
                        : 'text-gray-600 hover:bg-gray-100'
                    }`}
                  >
                    <Icon className="h-5 w-5 flex-shrink-0" />
                    {sidebarOpen && <span className="text-sm font-medium">{item.name}</span>}
                  </button>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* Sidebar Footer */}
        <div className="p-4 border-t border-gray-200">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="w-full flex items-center justify-center gap-2 px-3 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <Menu className="h-5 w-5" />
            {sidebarOpen && <span className="text-sm">طي القائمة</span>}
          </button>
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 px-3 py-2 mt-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
          >
            <LogOut className="h-5 w-5" />
            {sidebarOpen && <span className="text-sm">تسجيل الخروج</span>}
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Top Header */}
        <div className="bg-white shadow-sm p-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <h2 className="text-xl font-bold text-gray-900">
                {menuItems.find(item => item.id === activeTab)?.name || 'لوحة التحكم'}
              </h2>
              {activeTab === 'dashboard' && (
                <div className="flex gap-2">
                  {quarters.map(quarter => (
                    <button
                      key={quarter}
                      onClick={() => setSelectedQuarter(quarter)}
                      className={`px-3 py-1 rounded-lg text-sm font-medium ${
                        {selectedQuarter === 'السنة كاملة' && (
  <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
    <h3 className="text-lg font-bold text-gray-900 mb-4">إحصائيات الأرباع</h3>
    <div className="grid grid-cols-4 gap-4">
      {Object.entries(overallStats.quarterlyBreakdown).map(([quarter, quarterOkrs]) => {
        const quarterProgress = quarterOkrs.length > 0 
          ? Math.round(quarterOkrs.reduce((sum, okr) => sum + okr.progress, 0) / quarterOkrs.length)
          : 0;
        const completed = quarterOkrs.filter(okr => okr.status === 'مكتمل').length;
        
        return (
          <div key={quarter} className="bg-gray-50 p-4 rounded-lg">
            <h4 className="font-semibold text-gray-900 mb-2">{quarter}</h4>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>الأهداف:</span>
                <span className="font-medium">{quarterOkrs.length}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>مكتمل:</span>
                <span className="font-medium text-green-600">{completed}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>التقدم:</span>
                <span className="font-medium">{quarterProgress}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                <div 
                  className={`h-2 rounded-full transition-all duration-300 ${
                    quarterProgress >= 80 ? 'bg-green-500' : 
                    quarterProgress >= 50 ? 'bg-blue-500' : 
                    quarterProgress >= 25 ? 'bg-yellow-500' : 'bg-red-500'
                  }`}
                  style={{ width: `${quarterProgress}%` }}
                ></div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  </div>
)}
                      }`}
                    >
                      {quarter}
                    </button>
                  ))}
                </div>
              )}
            </div>
            
            {activeTab === 'dashboard' && (
              <button
                onClick={() => setShowForm(true)}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2"
              >
                <Plus className="h-5 w-5" />
                إضافة هدف جديد
              </button>
            )}
          </div>
        </div>

        {/* Main Content Area */}
        <div className="flex-1 p-6 overflow-auto">
          {renderContent()}
        </div>
      </div>

      {/* OKR Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[80vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold">
                {editingOkr ? 'تعديل الهدف' : 'إضافة هدف جديد'}
              </h2>
              <button onClick={resetForm} className="text-gray-500 hover:text-gray-700">
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  الهدف الرئيسي
                </label>
                <textarea
                  value={formData.objective}
                  onChange={(e) => setFormData({ ...formData, objective: e.target.value })}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  rows="3"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    الربع
                  </label>
                  <select
                    value={formData.quarter}
                    onChange={(e) => setFormData({ ...formData, quarter: e.target.value })}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    {quarters.map(quarter => (
                      <option key={quarter} value={quarter}>{quarter}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    المسؤول
                  </label>
                  <input
                    type="text"
                    value={formData.owner}
                    onChange={(e) => setFormData({ ...formData, owner: e.target.value })}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-sm font-medium text-gray-700">
                    النتائج الرئيسية
                  </label>
                  <button
                    type="button"
                    onClick={addKeyResult}
                    className="text-blue-600 hover:text-blue-700 text-sm flex items-center gap-1"
                  >
                    <Plus className="h-4 w-4" />
                    إضافة نتيجة
                  </button>
                </div>

                {formData.keyResults.map((kr, index) => (
                  <div key={index} className="border border-gray-200 rounded-lg p-4 mb-3">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-gray-600">
                        النتيجة الرئيسية {index + 1}
                      </span>
                      {formData.keyResults.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeKeyResult(index)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                    
                    <textarea
                      value={kr.description}
                      onChange={(e) => updateKeyResult(index, 'description', e.target.value)}
                      placeholder="وصف النتيجة الرئيسية"
                      className="w-full p-2 border border-gray-300 rounded mb-2 focus:ring-2 focus:ring-blue-500"
                      rows="2"
                      required
                    />
                    
                    <div className="grid grid-cols-2 gap-2">
                      <input
                        type="number"
                        value={kr.target}
                        onChange={(e) => updateKeyResult(index, 'target', e.target.value)}
                        placeholder="الهدف المطلوب"
                        className="p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                        required
                      />
                      <input
                        type="text"
                        value={kr.unit}
                        onChange={(e) => updateKeyResult(index, 'unit', e.target.value)}
                        placeholder="الوحدة (%, عدد، ساعة...)"
                        className="p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                        required
                      />
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={handleSubmit}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg flex items-center gap-2"
                >
                  <Save className="h-4 w-4" />
                  {editingOkr ? 'تحديث الهدف' : 'حفظ الهدف'}
                </button>
                <button
                  type="button"
                  onClick={resetForm}
                  className="bg-gray-300 hover:bg-gray-400 text-gray-700 px-6 py-2 rounded-lg"
                >
                  إلغاء
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );};

export default OKRIGS;
