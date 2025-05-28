from flask import Flask, request, jsonify
from flask_cors import CORS
from flask_sqlalchemy import SQLAlchemy
from datetime import datetime
import os
from dotenv import load_dotenv
import uuid

# بارگذاری متغیرهای محیطی
load_dotenv()

app = Flask(__name__)

# تنظیمات CORS برای ارتباط با frontend
CORS(app, origins=["http://localhost:3000"])

# تنظیمات پایگاه داده
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///school_schedule.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.config['SECRET_KEY'] = os.getenv('SECRET_KEY', 'your-secret-key-here')

db = SQLAlchemy(app)

# مدل‌های پایگاه داده
class Personnel(db.Model):
    __tablename__ = 'personnel'
    
    id = db.Column(db.String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    personnel_code = db.Column(db.String(50), unique=True, nullable=False)
    full_name = db.Column(db.String(100), nullable=False)
    main_position = db.Column(db.String(100), nullable=False)
    employment_status = db.Column(db.String(50), nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # رابطه با برنامه‌ها
    schedules = db.relationship('Schedule', backref='personnel_ref', lazy=True, cascade='all, delete-orphan')
    
    def to_dict(self):
        return {
            'id': self.id,
            'personnelCode': self.personnel_code,
            'fullName': self.full_name,
            'mainPosition': self.main_position,
            'employmentStatus': self.employment_status
        }

class Schedule(db.Model):
    __tablename__ = 'schedules'
    
    id = db.Column(db.String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    personnel_id = db.Column(db.String(36), db.ForeignKey('personnel.id'), nullable=False)
    personnel_code = db.Column(db.String(50), nullable=False)
    employment_status = db.Column(db.String(50), nullable=False)
    main_position = db.Column(db.String(100), nullable=False)
    
    # اطلاعات کلاس
    grade = db.Column(db.String(20), nullable=False)
    class_number = db.Column(db.String(10), nullable=False)
    field = db.Column(db.String(50), nullable=False)
    class_schedule_id = db.Column(db.String(100), nullable=False)
    
    # اطلاعات زمان
    day = db.Column(db.String(20), nullable=False)
    time_start = db.Column(db.String(10), nullable=False)
    time_end = db.Column(db.String(10), nullable=False)
    
    # اطلاعات درس
    hour_type = db.Column(db.String(50), nullable=False)
    teaching_group = db.Column(db.String(100), nullable=False)
    description = db.Column(db.Text, nullable=False)
    
    # متادیتا
    timestamp = db.Column(db.BigInteger, nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    def to_dict(self):
        return {
            'id': self.id,
            'personnelId': self.personnel_id,
            'personnelCode': self.personnel_code,
            'employmentStatus': self.employment_status,
            'mainPosition': self.main_position,
            'grade': self.grade,
            'classNumber': self.class_number,
            'field': self.field,
            'classScheduleId': self.class_schedule_id,
            'day': self.day,
            'timeStart': self.time_start,
            'timeEnd': self.time_end,
            'hourType': self.hour_type,
            'teachingGroup': self.teaching_group,
            'description': self.description,
            'timestamp': self.timestamp
        }

class ClassSchedule(db.Model):
    __tablename__ = 'class_schedules'
    
    id = db.Column(db.String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    grade = db.Column(db.String(20), nullable=False)
    class_number = db.Column(db.String(10), nullable=False)
    field = db.Column(db.String(50), nullable=False)
    timestamp = db.Column(db.BigInteger, nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # ایجاد ایندکس منحصر به فرد برای ترکیب grade, class_number, field
    __table_args__ = (db.UniqueConstraint('grade', 'class_number', 'field', name='unique_class'),)
    
    def to_dict(self):
        # دریافت برنامه‌های مرتبط با این کلاس
        schedules = Schedule.query.filter_by(
            grade=self.grade,
            class_number=self.class_number,
            field=self.field
        ).all()
        
        return {
            'id': self.id,
            'grade': self.grade,
            'classNumber': self.class_number,
            'field': self.field,
            'schedules': [schedule.to_dict() for schedule in schedules],
            'timestamp': self.timestamp
        }

# API Endpoints

@app.route('/api/health', methods=['GET'])
def health_check():
    """بررسی سلامت سرور"""
    return jsonify({'status': 'healthy', 'message': 'سرور در حال اجرا است'})

# === API های مربوط به پرسنل ===

@app.route('/api/personnel', methods=['GET'])
def get_all_personnel():
    """دریافت لیست تمام پرسنل"""
    try:
        personnel_list = Personnel.query.all()
        return jsonify([p.to_dict() for p in personnel_list])
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/personnel/<personnel_id>', methods=['GET'])
def get_personnel(personnel_id):
    """دریافت اطلاعات یک پرسنل"""
    try:
        personnel = Personnel.query.get_or_404(personnel_id)
        return jsonify(personnel.to_dict())
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/personnel/by-code/<personnel_code>', methods=['GET'])
def get_personnel_by_code(personnel_code):
    """دریافت اطلاعات پرسنل با کد پرسنلی"""
    try:
        personnel = Personnel.query.filter_by(personnel_code=personnel_code).first()
        if not personnel:
            return jsonify({'error': 'پرسنل یافت نشد'}), 404
        return jsonify(personnel.to_dict())
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/personnel', methods=['POST'])
def create_personnel():
    """ایجاد پرسنل جدید"""
    try:
        data = request.get_json()
        
        # بررسی وجود کد پرسنلی
        existing = Personnel.query.filter_by(personnel_code=data['personnelCode']).first()
        if existing:
            return jsonify({'error': 'کد پرسنلی قبلاً وجود دارد'}), 400
        
        personnel = Personnel(
            personnel_code=data['personnelCode'],
            full_name=data['fullName'],
            main_position=data['mainPosition'],
            employment_status=data['employmentStatus']
        )
        
        db.session.add(personnel)
        db.session.commit()
        
        return jsonify(personnel.to_dict()), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@app.route('/api/personnel/<personnel_id>', methods=['PUT'])
def update_personnel(personnel_id):
    """به‌روزرسانی اطلاعات پرسنل"""
    try:
        personnel = Personnel.query.get_or_404(personnel_id)
        data = request.get_json()
        
        personnel.full_name = data.get('fullName', personnel.full_name)
        personnel.main_position = data.get('mainPosition', personnel.main_position)
        personnel.employment_status = data.get('employmentStatus', personnel.employment_status)
        
        db.session.commit()
        return jsonify(personnel.to_dict())
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

# === API های مربوط به برنامه‌های پرسنلی ===

@app.route('/api/personnel/<personnel_id>/schedules', methods=['GET'])
def get_personnel_schedules(personnel_id):
    """دریافت برنامه‌های یک پرسنل"""
    try:
        personnel = Personnel.query.get_or_404(personnel_id)
        schedules = Schedule.query.filter_by(personnel_id=personnel_id).all()
        
        return jsonify({
            'personnel': personnel.to_dict(),
            'schedules': [s.to_dict() for s in schedules],
            'timestamp': int(datetime.utcnow().timestamp() * 1000)
        })
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/personnel/by-code/<personnel_code>/schedules', methods=['GET'])
def get_personnel_schedules_by_code(personnel_code):
    """دریافت برنامه‌های پرسنل با کد پرسنلی"""
    try:
        personnel = Personnel.query.filter_by(personnel_code=personnel_code).first()
        if not personnel:
            return jsonify({'error': 'پرسنل یافت نشد'}), 404
            
        schedules = Schedule.query.filter_by(personnel_id=personnel.id).all()
        
        return jsonify({
            'personnel': personnel.to_dict(),
            'schedules': [s.to_dict() for s in schedules],
            'timestamp': int(datetime.utcnow().timestamp() * 1000)
        })
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/personnel/<personnel_id>/schedules', methods=['POST'])
def save_personnel_schedules(personnel_id):
    """ذخیره برنامه‌های پرسنل"""
    try:
        personnel = Personnel.query.get_or_404(personnel_id)
        data = request.get_json()
        
        # حذف برنامه‌های قبلی
        Schedule.query.filter_by(personnel_id=personnel_id).delete()
        
        # اضافه کردن برنامه‌های جدید
        for schedule_data in data.get('schedules', []):
            schedule = Schedule(
                personnel_id=personnel_id,
                personnel_code=personnel.personnel_code,
                employment_status=personnel.employment_status,
                main_position=personnel.main_position,
                grade=schedule_data['grade'],
                class_number=schedule_data['classNumber'],
                field=schedule_data['field'],
                class_schedule_id=f"{schedule_data['grade']}-{schedule_data['classNumber']}-{schedule_data['field']}",
                day=schedule_data['day'],
                time_start=schedule_data['timeStart'],
                time_end=schedule_data['timeEnd'],
                hour_type=schedule_data['hourType'],
                teaching_group=schedule_data['teachingGroup'],
                description=schedule_data['description'],
                timestamp=int(datetime.utcnow().timestamp() * 1000)
            )
            db.session.add(schedule)
        
        # به‌روزرسانی یا ایجاد برنامه کلاسی
        for schedule_data in data.get('schedules', []):
            class_schedule_id = f"{schedule_data['grade']}-{schedule_data['classNumber']}-{schedule_data['field']}"
            class_schedule = ClassSchedule.query.filter_by(
                grade=schedule_data['grade'],
                class_number=schedule_data['classNumber'],
                field=schedule_data['field']
            ).first()
            
            if not class_schedule:
                class_schedule = ClassSchedule(
                    grade=schedule_data['grade'],
                    class_number=schedule_data['classNumber'],
                    field=schedule_data['field'],
                    timestamp=int(datetime.utcnow().timestamp() * 1000)
                )
                db.session.add(class_schedule)
        
        db.session.commit()
        
        return jsonify({
            'message': 'برنامه‌ها با موفقیت ذخیره شدند',
            'personnel': personnel.to_dict(),
            'timestamp': int(datetime.utcnow().timestamp() * 1000)
        })
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

# === API های مربوط به برنامه‌های کلاسی ===

@app.route('/api/class-schedules', methods=['GET'])
def get_all_class_schedules():
    """دریافت تمام برنامه‌های کلاسی"""
    try:
        class_schedules = ClassSchedule.query.all()
        return jsonify([cs.to_dict() for cs in class_schedules])
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/class-schedules/<grade>/<class_number>/<field>', methods=['GET'])
def get_class_schedule(grade, class_number, field):
    """دریافت برنامه یک کلاس خاص"""
    try:
        class_schedule = ClassSchedule.query.filter_by(
            grade=grade,
            class_number=class_number,
            field=field
        ).first()
        
        if not class_schedule:
            # اگر برنامه کلاسی وجود ندارد، برنامه‌های پرسنلی مرتبط را جستجو کن
            schedules = Schedule.query.filter_by(
                grade=grade,
                class_number=class_number,
                field=field
            ).all()
            
            return jsonify({
                'id': f"{grade}-{class_number}-{field}",
                'grade': grade,
                'classNumber': class_number,
                'field': field,
                'schedules': [s.to_dict() for s in schedules],
                'timestamp': int(datetime.utcnow().timestamp() * 1000)
            })
        
        return jsonify(class_schedule.to_dict())
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/class-schedules/<grade>/<class_number>/<field>', methods=['POST'])
def save_class_schedule(grade, class_number, field):
    """ذخیره برنامه کلاسی"""
    try:
        data = request.get_json()
        
        # پیدا کردن یا ایجاد برنامه کلاسی
        class_schedule = ClassSchedule.query.filter_by(
            grade=grade,
            class_number=class_number,
            field=field
        ).first()
        
        if not class_schedule:
            class_schedule = ClassSchedule(
                grade=grade,
                class_number=class_number,
                field=field,
                timestamp=int(datetime.utcnow().timestamp() * 1000)
            )
            db.session.add(class_schedule)
        else:
            class_schedule.timestamp = int(datetime.utcnow().timestamp() * 1000)
        
        db.session.commit()
        
        return jsonify({
            'message': 'برنامه کلاسی با موفقیت ذخیره شد',
            'classSchedule': class_schedule.to_dict()
        })
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

# === API های مربوط به برنامه‌ها ===

@app.route('/api/schedules/<schedule_id>', methods=['DELETE'])
def delete_schedule(schedule_id):
    """حذف یک برنامه"""
    try:
        schedule = Schedule.query.get_or_404(schedule_id)
        db.session.delete(schedule)
        db.session.commit()
        
        return jsonify({'message': 'برنامه با موفقیت حذف شد'})
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@app.route('/api/schedules/<schedule_id>', methods=['PUT'])
def update_schedule(schedule_id):
    """به‌روزرسانی یک برنامه"""
    try:
        schedule = Schedule.query.get_or_404(schedule_id)
        data = request.get_json()
        
        # به‌روزرسانی فیلدها
        for field, value in data.items():
            if hasattr(schedule, field.lower().replace('_', '')):
                setattr(schedule, field.lower().replace('_', ''), value)
        
        schedule.timestamp = int(datetime.utcnow().timestamp() * 1000)
        db.session.commit()
        
        return jsonify(schedule.to_dict())
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

# === API های کمکی ===

@app.route('/api/clear-all', methods=['DELETE'])
def clear_all_schedules():
    """حذف تمام برنامه‌ها"""
    try:
        Schedule.query.delete()
        ClassSchedule.query.delete()
        db.session.commit()
        
        return jsonify({'message': 'تمام برنامه‌ها با موفقیت حذف شدند'})
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

# ایجاد جداول پایگاه داده
with app.app_context():
    db.create_all()

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000) 