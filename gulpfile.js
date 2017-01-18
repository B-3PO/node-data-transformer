var gulp = require('gulp');
var gutil = require('gulp-util');
var mocha = require('gulp-mocha');
var istanbul = require('gulp-istanbul');

gulp.task('test', ['test-coverage'], function() {
  process.env.NODE_ENV = 'test';
  return gulp.src('tests/**/*spec.js')
    .pipe(mocha({ reporter: 'progress' }))
    .pipe(istanbul.writeReports({
      dir: './coverage/main',
      reporters: ['json', 'html', 'text-summary']
    }))
    .on('error', function(error) {
      console.log(error);
    })
    .on('end', function() {
      gutil.log('Finished', gutil.colors.green('✔ Node Tests'));
    });
});

gulp.task('test-coverage', function() {
  process.env.NODE_ENV = 'test';
  return gulp.src('lib/**/*.js')
    .pipe(istanbul())
    .pipe(istanbul.hookRequire());
});
