'use strict';

var gulp = require('gulp'),
	uglify = require('gulp-uglify'),
	concat = require('gulp-concat');

gulp.task('build', function(){

  return gulp.src([
  		'lib/*.js',
  		'!lib/*.min.js'
  	])
    .pipe(uglify())
    .pipe(concat('emmi.min.js'))
    .pipe(gulp.dest('lib'));
});

