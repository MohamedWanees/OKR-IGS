import React, { useState, useEffect } from 'react';
import { db } from './firebase';
import { 
  collection, 
  addDoc, 
  getDocs, 
  updateDoc, 
  deleteDoc, 
  doc, 
  onSnapshot 
} from 'firebase/firestore';
import './index.css';

const OKRIGS = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [currentUser, setCurrentUser] = useState('');
  const [objectives, setObjectives] = useState([]);
  const [newObjective, setNewObjective] = useState({
    title: '',
    description: '',
    quarter: 'Q1 2025',
    owner: ''
  });

  // Load objectives from Firestore
  useEffect(() => {
    if (isLoggedIn) {
      const unsubscribe = onSnapshot(collection(db, 'objectives'), (snapshot) => {
        const objectivesData = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setObjectives(objectivesData);
      });

      return () => unsubscribe();
    }
  }, [isLoggedIn]);

  const handleLogin = (e) => {
    e.preventDefault();
    const username = e.target.username.value;
    const password = e.target.password.value;
    
    if (username && password) {
      setCurrentUser(username);
      setIsLoggedIn(true);
    } else {
      alert('يرجى إدخال اسم المستخدم وكلمة المرور');
    }
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setCurrentUser('');
    setObjectives([]);
  };

  const addObjective = async () => {
    if (newObjective.title && newObjective.description) {
      try {
        const objectiveToAdd = {
          ...newObjective,
          owner: newObjective.owner || currentUser,
          createdAt: new Date(),
          keyResults: []
        };
        
        await addDoc(collection(db, 'objectives'), objectiveToAdd);
        
        setNewObjective({
          title: '',
          description: '',
          quarter: 'Q1 2025',
          owner: ''
        });
      } catch (error) {
        console.error('Error adding objective:', error);
        alert('حدث خطأ في إضافة الهدف');
      }
    }
  };

  const addKeyResult = async (objectiveId) => {
    const title = prompt('عنوان النتيجة الرئيسية:');
    const target = prompt('الهدف المطلوب (رقم):');
    
    if (title && target) {
      try {
        const objectiveRef = doc(db, 'objectives', objectiveId);
        const objective = objectives.find(obj => obj.id === objectiveId);
        
        const newKeyResult = {
          id: Date.now(),
          title,
          target: parseFloat(target),
          current: 0,
          progress: 0
        };

        const updatedKeyResults = [...(objective.keyResults || []), newKeyResult];
        
        await updateDoc(objectiveRef, {
          keyResults: updatedKeyResults
        });
      } catch (error) {
        console.error('Error adding key result:', error);
        alert('حدث خطأ في إضافة النتيجة الرئيسية');
      }
    }
  };

  const updateKeyResult = async (objectiveId, keyResultId, current) => {
    try {
      const objectiveRef = doc(db, 'objectives', objectiveId);
      const objective = objectives.find(obj => obj.id === objectiveId);
      
      const updatedKeyResults = objective.keyResults.map(kr => {
        if (kr.id === keyResultId) {
          const progress = (current / kr.target) * 100;
          return { ...kr, current: parseFloat(current), progress: Math.min(progress, 100) };
        }
        return kr;
      });

      await updateDoc(objectiveRef, {
        keyResults: updatedKeyResults
      });
    } catch (error) {
      console.error('Error updating key result:', error);
      alert('حدث خطأ في تحديث النتيجة الرئيسية');
    }
  };

  const deleteObjective = async (objectiveId) => {
    if (window.confirm('هل أنت متأكد من حذف هذا الهدف؟')) {
      try {
        await deleteDoc(doc(db, 'objectives', objectiveId));
      } catch (error) {
        console.error('Error deleting objective:', error);
        alert('حدث خطأ في حذف الهدف');
      }
    }
  };

  const calculateObjectiveProgress = (keyResults) => {
    if (!keyResults || keyResults.length === 0) return 0;
    const totalProgress = keyResults.reduce((sum, kr) => sum + kr.progress, 0);
    return totalProgress / keyResults.length;
  };

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-900 to-purple-900 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-xl p-8 w-full max-w-md">
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold text-gray-900">نظام OKR-IGS</h1>
            <p className="text-gray-600 mt-2">إدارة الأهداف والنتائج الرئيسية</p>
          </div>
          
          <form onSubmit={handleLogin} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                اسم المستخدم
              </label>
              <input
                type="text"
                name="username"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                كلمة المرور
              </label>
              <input
                type="password"
                name="password"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            
            <button
              type="submit"
              className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition duration-200"
            >
              تسجيل الدخول
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <h1 className="text-3xl font-bold text-gray-900">نظام OKR-IGS</h1>
            <div className="flex items-center space-x-4">
              <span className="text-gray-600">مرحباً، {currentUser}</span>
              <button
                onClick={handleLogout}
                className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 transition duration-200"
              >
                تسجيل الخروج
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Add New Objective */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-xl font-bold text-gray-900 mb-4">إضافة هدف جديد</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                عنوان الهدف
              </label>
              <input
                type="text"
                value={newObjective.title}
                onChange={(e) => setNewObjective({...newObjective, title: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="مثال: زيادة المبيعات"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                المسؤول
              </label>
              <input
                type="text"
                value={newObjective.owner}
                onChange={(e) => setNewObjective({...newObjective, owner: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder={currentUser}
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                الربع
              </label>
              <select
                value={newObjective.quarter}
                onChange={(e) => setNewObjective({...newObjective, quarter: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="Q1 2025">Q1 2025</option>
                <option value="Q2 2025">Q2 2025</option>
                <option value="Q3 2025">Q3 2025</option>
                <option value="Q4 2025">Q4 2025</option>
              </select>
            </div>
          </div>
          
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              وصف الهدف
            </label>
            <textarea
              value={newObjective.description}
              onChange={(e) => setNewObjective({...newObjective, description: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              rows="3"
              placeholder="وصف تفصيلي للهدف..."
            ></textarea>
          </div>
          
          <button
            onClick={addObjective}
            className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 transition duration-200"
          >
            إضافة الهدف
          </button>
        </div>

        {/* Objectives List */}
        <div className="space-y-6">
          {objectives.map((objective) => (
            <div key={objective.id} className="bg-white rounded-lg shadow-md p-6">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-xl font-bold text-gray-900">{objective.title}</h3>
                  <p className="text-gray-600 mt-1">{objective.description}</p>
                  <div className="flex items-center space-x-4 mt-2 text-sm text-gray-500">
                    <span>المسؤول: {objective.owner}</span>
                    <span>الربع: {objective.quarter}</span>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="text-right">
                    <div className="text-2xl font-bold text-blue-600">
                      {calculateObjectiveProgress(objective.keyResults).toFixed(0)}%
                    </div>
                    <div className="text-sm text-gray-500">مكتمل</div>
                  </div>
                  <button
                    onClick={() => deleteObjective(objective.id)}
                    className="text-red-600 hover:text-red-800 transition duration-200"
                  >
                    🗑️
                  </button>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="w-full bg-gray-200 rounded-full h-2 mb-4">
                <div
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${calculateObjectiveProgress(objective.keyResults)}%` }}
                ></div>
              </div>

              {/* Key Results */}
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <h4 className="font-semibold text-gray-900">النتائج الرئيسية</h4>
                  <button
                    onClick={() => addKeyResult(objective.id)}
                    className="bg-green-600 text-white px-3 py-1 rounded text-sm hover:bg-green-700 transition duration-200"
                  >
                    + إضافة نتيجة
                  </button>
                </div>

                {objective.keyResults && objective.keyResults.map((keyResult) => (
                  <div key={keyResult.id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex justify-between items-center mb-2">
                      <span className="font-medium">{keyResult.title}</span>
                      <span className="text-sm text-gray-500">
                        {keyResult.current} / {keyResult.target}
                      </span>
                    </div>
                    
                    <div className="flex items-center space-x-3">
                      <div className="flex-1">
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-green-600 h-2 rounded-full transition-all duration-300"
                            style={{ width: `${keyResult.progress}%` }}
                          ></div>
                        </div>
                      </div>
                      <div className="text-sm font-medium text-gray-900">
                        {keyResult.progress.toFixed(0)}%
                      </div>
                    </div>
                    
                    <div className="mt-2">
                      <label className="block text-xs text-gray-500 mb-1">تحديث القيمة الحالية:</label>
                      <input
                        type="number"
                        value={keyResult.current}
                        onChange={(e) => updateKeyResult(objective.id, keyResult.id, e.target.value)}
                        className="w-20 px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                        step="0.1"
                        min="0"
                        max={keyResult.target}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {objectives.length === 0 && (
          <div className="text-center py-12">
            <div className="text-gray-400 text-lg">لا توجد أهداف محددة بعد</div>
            <div className="text-gray-500 text-sm mt-2">ابدأ بإضافة هدفك الأول!</div>
          </div>
        )}
      </div>
    </div>
  );
};

export default OKRIGS;
