// Import the necessary modules
import { expect } from 'chai';
import sinon from 'sinon';
import { auth, db, doc, updateDoc, onSnapshot } from '../src/js/FirebaseConfig.js';
import toastr from 'toastr'; 

// Mock Firebase and Toastr
let mockOnAuthStateChanged;
let mockOnSnapshot;
let mockUpdateDoc;
let mockToastr;

describe('Enrollment Script Tests', function() {

  beforeEach(() => {
    // Set up spies and mocks
    mockOnAuthStateChanged = sinon.stub(auth, 'onAuthStateChanged');
    mockOnSnapshot = sinon.stub(onSnapshot);
    mockUpdateDoc = sinon.stub(updateDoc);
    mockToastr = sinon.stub(toastr, 'success');
    sinon.stub(toastr, 'error');
    sinon.stub(toastr, 'warning');
  });

  afterEach(() => {
    // Restore spies and mocks after each test
    sinon.restore();
  });

  it('should call toastr.success when enrollment is submitted successfully', async function() {
    const mockUid = 'mock-user-id';

    // Mock Firebase authentication
    mockOnAuthStateChanged.callsFake((callback) => {
      callback({ uid: mockUid }); // Simulate user being logged in
    });

    // Mock document update
    mockUpdateDoc.resolves(); // Simulate successful document update

    // Your enrollment form submission code
    const event = {
      preventDefault: () => {},
    };

    // Simulate the user filling out the form and submitting it
    const department = 'BIT';
    const year = '1';
    const selectedSubjectCode = 'BIT101';
    const selectedSubjectName = 'Computer Architecture and Organisation';

    await submitEnrollment(event); // Assuming submitEnrollment is globally accessible

    // Check that the toastr success message was triggered
    expect(mockToastr.calledOnceWith('Enrollment submitted for approval!')).to.be.true;
  });

  it('should call toastr.error when document update fails', async function() {
    const mockUid = 'mock-user-id';

    // Mock Firebase authentication
    mockOnAuthStateChanged.callsFake((callback) => {
      callback({ uid: mockUid }); // Simulate user being logged in
    });

    // Mock document update to simulate an error
    mockUpdateDoc.rejects(new Error('Firebase update failed'));

    const event = {
      preventDefault: () => {},
    };

    // Simulate the user filling out the form and submitting it
    const department = 'BIT';
    const year = '1';
    const selectedSubjectCode = 'BIT101';
    const selectedSubjectName = 'Computer Architecture and Organisation';

    await submitEnrollment(event); // Assuming submitEnrollment is globally accessible

    // Check that toastr.error message was triggered
    expect(mockToastr.calledOnceWith('Error updating document: ', sinon.match.any)).to.be.true;
  });

  it('should call toastr.warning when enrollment form is incomplete', async function() {
    const event = {
      preventDefault: () => {},
    };

    // Simulate an incomplete form (missing department, year, etc.)
    const department = '';
    const year = '';
    const selectedSubjectCode = '';
    const selectedSubjectName = '';

    await submitEnrollment(event); // Assuming submitEnrollment is globally accessible

    // Check that toastr.warning message was triggered
    expect(mockToastr.calledOnceWith('Please fill in all fields before submitting.')).to.be.true;
  });

  it('should listen for real-time updates from Firebase', function(done) {
    const mockUid = 'mock-user-id';

    // Simulate Firebase snapshot
    mockOnSnapshot.callsFake((docRef, callback) => {
      callback({ exists: () => true, data: () => ({ enrolledSubjects: { BIT101: { name: 'Computer Architecture and Organisation', status: 'Submitted' } } }) });
    });

    // Simulate user being logged in
    mockOnAuthStateChanged.callsFake((callback) => {
      callback({ uid: mockUid });
    });

    // Call the fetchEnrolledSubjects function (which should trigger onSnapshot)
    fetchEnrolledSubjects();

    // Wait for the snapshot and check if the table is populated
    setTimeout(() => {
      const tbody = document.querySelector('.enrollment-table tbody');
      const rows = tbody.querySelectorAll('tr');
      expect(rows.length).to.equal(1);
      expect(rows[0].textContent).to.include('BIT101');
      done();
    }, 1000); // Give it a bit of time for the snapshot callback to run
  });

});
