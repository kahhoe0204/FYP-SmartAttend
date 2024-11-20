// const jsdom = require("jsdom");
// const { JSDOM } = jsdom;
// const toastr = require("toastr");

// const { handleLogin } = require("../src/js/FirebaseConfig"); // Import handleLogin function

// // Setup JSDOM for simulating DOM elements
// const dom = new JSDOM(`
// <!DOCTYPE html>
// <html>
//   <body>
//     <form id="loginForm">
//       <input type="email" id="email" value="shawjasmyn2002@gmail.com" required />
//       <input type="password" id="password" value="1234567890" required />
//       <select id="institution">
//         <option value="help_university" selected>HELP University</option>
//       </select>
//     </form>
//   </body>
// </html>
// `);

// global.document = dom.window.document;
// global.window = dom.window;

// describe("handleLogin function tests", () => {
//   let signInWithEmailAndPasswordMock;

//   beforeEach(() => {
//     // Mock Firebase Auth methods
//     signInWithEmailAndPasswordMock = jest.fn();
//     global.firebase = {
//       auth: jest.fn(() => ({
//         signInWithEmailAndPassword: signInWithEmailAndPasswordMock,
//       })),
//     };
//   });

//   afterEach(() => {
//     jest.resetAllMocks(); // Reset all mocks between tests
//   });

//   it("should log in successfully with valid credentials", async () => {
//     // Mock Firebase signInWithEmailAndPassword success
//     signInWithEmailAndPasswordMock.mockResolvedValueOnce({
//       user: { email: "shawjasmyn2002@gmail.com" },
//     });

//     const result = await handleLogin("shawjasmyn2002@gmail.com", "1234567890");
//     expect(result.user.email).toBe("shawjasmyn2002@gmail.com"); // Jest assertion
//   });

//   it("should throw an error with invalid credentials", async () => {
//     // Mock Firebase signInWithEmailAndPassword failure
//     signInWithEmailAndPasswordMock.mockRejectedValueOnce(
//       new Error("Invalid email or password")
//     );

//     await expect(
//       handleLogin("invalid@example.com", "wrongpassword")
//     ).rejects.toThrow("Invalid email or password"); // Jest assertion
//   });
// });

import {firebaseAdmin} from '../src/js/FirebaseConfig';

import { FetchProvider } from '@firebase/auth';
import fetch from 'node-fetch';

// Initialize fetch polyfill
FetchProvider.initialize(fetch);

// Mock Firebase Admin
jest.mock('firebase-admin', () => ({
  database: jest.fn(() => ({
    ref: jest.fn(() => ({
      push: jest.fn(() => ({
        set: jest.fn().mockResolvedValue(true),
      })),
    })),
  })),
}));

const { handleLogin } = require("../src/js/FirebaseConfig");

describe('createFreeCourse', () => {
  it('creates a course', async () => {
    const result = await handleLogin(
      'shawjasmyn2002@gmail.com',
      '1234567890',
    );

    expect(result).toBe(true); // Verify successful login

    const set = firebaseAdmin
      .database()
      .ref()
      .push().set;

    expect(set).toHaveBeenCalledTimes(1);
    expect(set).toHaveBeenCalledWith({
      courseId: 'THE_ROAD_TO_GRAPHQL',
      packageId: 'STUDENT',
      invoice: {
        createdAt: 'TIMESTAMP',
        amount: 0,
        licensesCount: 1,
        currency: 'USD',
        paymentType: 'FREE',
      },
    });
  });
});

  
