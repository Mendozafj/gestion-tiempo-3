var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var methodOverride = require('method-override');

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
const activitiesRouter = require('./routes/activities');
const categoriesRouter = require('./routes/categories');
const habitsRouter = require('./routes/habits');
const projectsRouter = require('./routes/projects');
const activityLogsRouter = require('./routes/activity_logs');
const authRouter = require('./routes/auth');

var app = express();
require('dotenv').config();
const db = require('./config/db');
app.use(methodOverride('_method'));

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

// Función helper para formatear fechas
app.locals.formatDate = (date) => {
  if (date && !isNaN(new Date(date).getTime())) {
    return new Intl.DateTimeFormat('es-VE', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(new Date(date));
  }
  return 'No especificado';
};

app.use('/', indexRouter);
app.use('/users', usersRouter);
app.use('/activities', activitiesRouter);
app.use('/categories', categoriesRouter);
app.use('/habits', habitsRouter);
app.use('/projects', projectsRouter);
app.use('/activity-logs', activityLogsRouter);
app.use('/auth', authRouter);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
