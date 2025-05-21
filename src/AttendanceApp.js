import { useState, useEffect } from 'react';

// 메인 앱 컴포넌트
const AttendanceApp = () => {
  // 상태 관리
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [users, setUsers] = useState(() => {
    // 로컬 스토리지에서 사용자 데이터 불러오기
    const savedUsers = localStorage.getItem('users');
    if (savedUsers) {
      return JSON.parse(savedUsers);
    } else {
      // 기본 관리자 계정 생성
      return [
        { id: 1, username: 'admin', password: 'admin123', name: '관리자', isAdmin: true }
      ];
    }
  });
  const [currentUser, setCurrentUser] = useState(null);
  const [attendanceRecords, setAttendanceRecords] = useState(() => {
    // 로컬 스토리지에서 출석 기록 불러오기
    const savedRecords = localStorage.getItem('attendanceRecords');
    return savedRecords ? JSON.parse(savedRecords) : [];
  });
  const [newUser, setNewUser] = useState({ username: '', password: '', name: '', isAdmin: false });
  const [currentView, setCurrentView] = useState('dashboard');
  const [currentDate] = useState(new Date().toISOString().split('T')[0]);

  // 로컬 스토리지에 데이터 저장
  useEffect(() => {
    localStorage.setItem('users', JSON.stringify(users));
  }, [users]);

  useEffect(() => {
    localStorage.setItem('attendanceRecords', JSON.stringify(attendanceRecords));
  }, [attendanceRecords]);

  // 로그인 처리
  const handleLogin = () => {
    const user = users.find(user => user.username === username && user.password === password);
    if (user) {
      setIsLoggedIn(true);
      setIsAdmin(user.isAdmin);
      setCurrentUser(user);
      setUsername('');
      setPassword('');
    } else {
      alert('아이디 또는 비밀번호가 일치하지 않습니다.');
    }
  };

  // 로그아웃 처리
  const handleLogout = () => {
    setIsLoggedIn(false);
    setIsAdmin(false);
    setCurrentUser(null);
    setCurrentView('dashboard');
  };

  // 출근 기록 처리
  const handleCheckIn = () => {
    const now = new Date();
    const newRecord = {
      userId: currentUser.id,
      userName: currentUser.name,
      date: now.toISOString().split('T')[0],
      checkInTime: now.toTimeString().split(' ')[0],
      checkOutTime: null
    };
    
    // 오늘 이미 출근했는지 확인
    const todayRecord = attendanceRecords.find(
      record => record.userId === currentUser.id && record.date === newRecord.date
    );
    
    if (todayRecord) {
      alert('이미 오늘 출근했습니다.');
      return;
    }
    
    setAttendanceRecords([...attendanceRecords, newRecord]);
    alert('출근이 기록되었습니다!');
  };

  // 퇴근 기록 처리
  const handleCheckOut = () => {
    const now = new Date();
    const today = now.toISOString().split('T')[0];
    
    // 오늘의 출근 기록 찾기
    const recordIndex = attendanceRecords.findIndex(
      record => record.userId === currentUser.id && record.date === today && !record.checkOutTime
    );
    
    if (recordIndex === -1) {
      alert('오늘 출근 기록이 없습니다.');
      return;
    }
    
    const updatedRecords = [...attendanceRecords];
    updatedRecords[recordIndex] = {
      ...updatedRecords[recordIndex],
      checkOutTime: now.toTimeString().split(' ')[0]
    };
    
    setAttendanceRecords(updatedRecords);
    alert('퇴근이 기록되었습니다!');
  };

  // 새 사용자 추가
  const handleAddUser = () => {
    if (!newUser.username || !newUser.password || !newUser.name) {
      alert('모든 필드를 입력해주세요.');
      return;
    }
    
    // 사용자명 중복 확인
    if (users.some(user => user.username === newUser.username)) {
      alert('이미 존재하는 사용자명입니다.');
      return;
    }
    
    const newUserId = users.length > 0 ? Math.max(...users.map(user => user.id)) + 1 : 1;
    const userToAdd = { ...newUser, id: newUserId };
    
    setUsers([...users, userToAdd]);
    setNewUser({ username: '', password: '', name: '', isAdmin: false });
    alert('사용자가 추가되었습니다.');
  };

  // 사용자 삭제
  const handleDeleteUser = (userId) => {
    if (window.confirm('정말 이 사용자를 삭제하시겠습니까?')) {
      setUsers(users.filter(user => user.id !== userId));
      // 해당 사용자의 출석 기록도 삭제
      setAttendanceRecords(attendanceRecords.filter(record => record.userId !== userId));
    }
  };

  // 현재 날짜의 출석 상태
  const getTodayAttendance = (userId) => {
    const record = attendanceRecords.find(
      record => record.userId === userId && record.date === currentDate
    );
    
    if (!record) return '미출근';
    if (record.checkInTime && !record.checkOutTime) return '출근';
    if (record.checkInTime && record.checkOutTime) return '퇴근';
  };

  // 관리자 권한 토글
  const toggleAdminStatus = (userId) => {
    setUsers(users.map(user => 
      user.id === userId ? { ...user, isAdmin: !user.isAdmin } : user
    ));
  };

  // 로그인 폼 렌더링
  const renderLoginForm = () => (
    <div className="login-container">
      <h2 className="login-title">로그인</h2>
      <div className="login-input-group">
        <label className="login-label">사용자명:</label>
        <input
          type="text"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          className="login-input"
          placeholder="사용자명 입력"
        />
      </div>
      <div className="login-input-group">
        <label className="login-label">비밀번호:</label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="login-input"
          placeholder="비밀번호 입력"
        />
      </div>
      <button
        onClick={handleLogin}
        className="login-button"
      >
        로그인
      </button>
    </div>
  );
  // 대시보드 렌더링
  const renderDashboard = () => (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-6">안녕하세요, {currentUser.name}님!</h2>
      <div className="flex gap-4 mb-6">
        <button
          onClick={handleCheckIn}
          className="bg-green-500 text-white py-2 px-4 rounded hover:bg-green-600"
        >
          출근하기
        </button>
        <button
          onClick={handleCheckOut}
          className="bg-red-500 text-white py-2 px-4 rounded hover:bg-red-600"
        >
          퇴근하기
        </button>
      </div>
      
      <div className="mt-8">
        <h3 className="text-xl font-semibold mb-4">나의 출근 기록 (최근 5일)</h3>
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="min-w-full">
            <thead className="bg-gray-100">
              <tr>
                <th className="py-2 px-4 text-left">날짜</th>
                <th className="py-2 px-4 text-left">출근 시간</th>
                <th className="py-2 px-4 text-left">퇴근 시간</th>
              </tr>
            </thead>
            <tbody>
              {attendanceRecords
                .filter(record => record.userId === currentUser.id)
                .sort((a, b) => new Date(b.date) - new Date(a.date))
                .slice(0, 5)
                .map((record, index) => (
                  <tr key={index} className="border-t">
                    <td className="py-2 px-4">{record.date}</td>
                    <td className="py-2 px-4">{record.checkInTime}</td>
                    <td className="py-2 px-4">{record.checkOutTime || '-'}</td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
  // 엑셀 다운로드 함수
  const downloadExcel = () => {
    // 현재 표시된 데이터를 가져옴
    let dataToExport = [];
    
    // 헤더 추가
    dataToExport.push(['이름', '날짜', '출근 시간', '퇴근 시간', '근무 시간']);
    
    // 데이터 추가
    attendanceRecords.forEach(record => {
      let workHours = '-';
      if (record.checkInTime && record.checkOutTime) {
        const checkIn = new Date(`${record.date}T${record.checkInTime}`);
        const checkOut = new Date(`${record.date}T${record.checkOutTime}`);
        const diffMs = checkOut - checkIn;
        const diffHrs = Math.floor(diffMs / (1000 * 60 * 60));
        const diffMins = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
        workHours = `${diffHrs}시간 ${diffMins}분`;
      }
      
      dataToExport.push([
        record.userName,
        record.date,
        record.checkInTime || '-',
        record.checkOutTime || '-',
        workHours
      ]);
    });
    
    // CSV 형식으로 변환 (BOM 추가)
    let csvContent = "\uFEFF"; // BOM for UTF-8
    dataToExport.forEach(row => {
      // 각 필드를 큰따옴표로 묶어 쉼표 문제 해결
      const quotedRow = row.map(field => `"${field}"`);
      const rowString = quotedRow.join(',');
      csvContent += rowString + "\r\n";
    });
    
    // 다운로드 링크 생성 및 클릭
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `출퇴근기록_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };
  // 사용자 관리 페이지 렌더링
  const renderUserManagement = () => (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-6">사용자 관리</h2>
      
      <div className="mb-8 bg-white p-4 rounded-lg shadow">
        <h3 className="text-xl font-semibold mb-4">새 사용자 추가</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-gray-700 mb-2">사용자명:</label>
            <input
              type="text"
              value={newUser.username}
              onChange={(e) => setNewUser({...newUser, username: e.target.value})}
              className="w-full p-2 border rounded"
            />
          </div>
          <div>
            <label className="block text-gray-700 mb-2">비밀번호:</label>
            <input
              type="password"
              value={newUser.password}
              onChange={(e) => setNewUser({...newUser, password: e.target.value})}
              className="w-full p-2 border rounded"
            />
          </div>
          <div>
            <label className="block text-gray-700 mb-2">이름:</label>
            <input
              type="text"
              value={newUser.name}
              onChange={(e) => setNewUser({...newUser, name: e.target.value})}
              className="w-full p-2 border rounded"
            />
          </div>
          <div className="flex items-center">
            <label className="inline-flex items-center mt-6">
              <input
                type="checkbox"
                checked={newUser.isAdmin}
                onChange={(e) => setNewUser({...newUser, isAdmin: e.target.checked})}
                className="form-checkbox h-5 w-5 text-blue-600"
              />
              <span className="ml-2 text-gray-700">관리자 권한</span>
            </label>
          </div>
        </div>
        <button
          onClick={handleAddUser}
          className="bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600"
        >
          사용자 추가
        </button>
      </div>
      
      <div>
        <h3 className="text-xl font-semibold mb-4">사용자 목록</h3>
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="min-w-full">
            <thead className="bg-gray-100">
              <tr>
                <th className="py-2 px-4 text-left">ID</th>
                <th className="py-2 px-4 text-left">사용자명</th>
                <th className="py-2 px-4 text-left">이름</th>
                <th className="py-2 px-4 text-left">권한</th>
                <th className="py-2 px-4 text-left">오늘 상태</th>
                <th className="py-2 px-4 text-left">관리</th>
              </tr>
            </thead>
            <tbody>
              {users.map(user => (
                <tr key={user.id} className="border-t">
                  <td className="py-2 px-4">{user.id}</td>
                  <td className="py-2 px-4">{user.username}</td>
                  <td className="py-2 px-4">{user.name}</td>
                  <td className="py-2 px-4">
                    {user.id !== 1 && (
                      <button
                        onClick={() => toggleAdminStatus(user.id)}
                        className={`py-1 px-2 rounded text-xs ${
                          user.isAdmin ? 'bg-purple-100 text-purple-800' : 'bg-gray-100 text-gray-800'
                        }`}
                      >
                        {user.isAdmin ? '관리자' : '일반 사용자'}
                      </button>
                    )}
                    {user.id === 1 && (
                      <span className="py-1 px-2 rounded text-xs bg-purple-100 text-purple-800">
                        최고 관리자
                      </span>
                    )}
                  </td>
                  <td className="py-2 px-4">
                    <span className={`py-1 px-2 rounded text-xs ${
                      getTodayAttendance(user.id) === '미출근' ? 'bg-gray-100 text-gray-800' :
                      getTodayAttendance(user.id) === '출근' ? 'bg-green-100 text-green-800' :
                      'bg-blue-100 text-blue-800'
                    }`}>
                      {getTodayAttendance(user.id)}
                    </span>
                  </td>
                  <td className="py-2 px-4">
                    {user.id !== 1 && (
                      <button
                        onClick={() => handleDeleteUser(user.id)}
                        className="text-red-500 hover:text-red-700"
                      >
                        삭제
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  // 출석 보고서 렌더링
  const renderAttendanceReport = () => {
    // 날짜별로 그룹화
    const recordsByDate = {};
    attendanceRecords.forEach(record => {
      if (!recordsByDate[record.date]) {
        recordsByDate[record.date] = [];
      }
      recordsByDate[record.date].push(record);
    });
    
    // 날짜 정렬
    const sortedDates = Object.keys(recordsByDate).sort((a, b) => new Date(b) - new Date(a));
    
    return (
      <div className="p-6">
        {/* 제목과 다운로드 버튼을 가로로 배치 */}
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">출석 보고서</h2>
          <button
            onClick={downloadExcel}
            className="bg-green-500 text-white py-2 px-4 rounded hover:bg-green-600"
          >
            엑셀 다운로드
          </button>
        </div>
        
        {sortedDates.length === 0 ? (
          <p className="text-gray-500">기록된 출석 데이터가 없습니다.</p>
        ) : (
          sortedDates.slice(0, 7).map(date => (
            <div key={date} className="mb-6">
              <h3 className="text-xl font-semibold mb-2">{date}</h3>
              <div className="bg-white rounded-lg shadow overflow-hidden">
                <table className="min-w-full">
                  <thead className="bg-gray-100">
                    <tr>
                      <th className="py-2 px-4 text-left">이름</th>
                      <th className="py-2 px-4 text-left">출근 시간</th>
                      <th className="py-2 px-4 text-left">퇴근 시간</th>
                      <th className="py-2 px-4 text-left">근무 시간</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recordsByDate[date].map((record, index) => {
                      // 근무 시간 계산
                      let workHours = '-';
                      if (record.checkInTime && record.checkOutTime) {
                        const checkIn = new Date(`${record.date}T${record.checkInTime}`);
                        const checkOut = new Date(`${record.date}T${record.checkOutTime}`);
                        const diffMs = checkOut - checkIn;
                        const diffHrs = Math.floor(diffMs / (1000 * 60 * 60));
                        const diffMins = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
                        workHours = `${diffHrs}시간 ${diffMins}분`;
                      }
                      
                      return (
                        <tr key={index} className="border-t">
                          <td className="py-2 px-4">{record.userName}</td>
                          <td className="py-2 px-4">{record.checkInTime}</td>
                          <td className="py-2 px-4">{record.checkOutTime || '-'}</td>
                          <td className="py-2 px-4">{workHours}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          ))
        )}
      </div>
    );
  };

  // 네비게이션 바 렌더링
  const renderNavigation = () => (
    <nav className="bg-gray-800 text-white p-4">
      <div className="container mx-auto flex justify-between items-center">
        <div className="font-bold text-xl">출퇴근 관리 앱</div>
        {isLoggedIn && (
          <div className="flex items-center">
            <div className="flex space-x-4 mr-6">
              <button
                onClick={() => setCurrentView('dashboard')}
                className={`${currentView === 'dashboard' ? 'text-blue-300' : 'text-white'}`}
              >
                대시보드
              </button>
              {isAdmin && (
                <>
                  <button
                    onClick={() => setCurrentView('users')}
                    className={`${currentView === 'users' ? 'text-blue-300' : 'text-white'}`}
                  >
                    사용자 관리
                  </button>
                  <button
                    onClick={() => setCurrentView('reports')}
                    className={`${currentView === 'reports' ? 'text-blue-300' : 'text-white'}`}
                  >
                    출석 보고서
                  </button>
                </>
              )}
            </div>
            <div className="flex items-center">
              <span className="mr-4">{currentUser.name} ({currentUser.isAdmin ? '관리자' : '사용자'})</span>
              <button
                onClick={handleLogout}
                className="bg-red-500 text-white py-1 px-3 rounded hover:bg-red-600"
              >
                로그아웃
              </button>
            </div>
          </div>
        )}
      </div>
    </nav>
  );

  // 메인 컨텐츠 렌더링
  const renderContent = () => {
    if (!isLoggedIn) {
      return (
        <div className="flex justify-center items-center min-h-screen bg-gray-100">
          {renderLoginForm()}
        </div>
      );
    }

    return (
      <div className="min-h-screen bg-gray-100">
        {renderNavigation()}
        <div className="container mx-auto py-4">
          {currentView === 'dashboard' && renderDashboard()}
          {currentView === 'users' && isAdmin && renderUserManagement()}
          {currentView === 'reports' && isAdmin && renderAttendanceReport()}
        </div>
      </div>
    );
  };

  return renderContent();
};

export default AttendanceApp;
