Act as a Senior  Engineer and Software Architect. I want to build a "Dental Insurance Policy, Billing, and Claims Management System" from the ground up using Node + vanilla JS(with HTML) and use local JSON as Data.

Go through below links to understand Policy Life Cycle better -
Link1: https://www.selectsys.com/blog/insurance-policy-lifecycle-explained
Link2: https://www.linkedin.com/pulselife-insurance-domain-architecture-detailed-practical-choudhury-uj78c

Checkout /Users/I562669/Desktop/openSource/policy_prj/DentalPLC_KB.md to understand the nuances of Dentail policy life cycle

After checking all the resources gather concrete information and save it in /Users/I562669/Desktop/openSource/policy_prj/PLC_Concepts.md file.. in a structured way.. like you want a fresh graduate to understand the document as a part of onboarding.. Do let me know if any concept are missing or you see any gaps .. i will try to resolve.

After update concepts doc.. start on the application.
I do not want the completed app yet. Instead, please generate a functional, production-ready project boilerplate/skeleton that sets up the foundation. 

Intent: This app is testing centric, so keep that in mind.. we will be majorly testing few scenarios like billing and claim processing.

Please provide:
1. A clean, modular folder structure separating routes, controllers, models, and middleware.
2. The core Database Schemas with basic relationships:
   - User/Policyholder (Name, Email, Role)
   - Policy (PolicyNumber, Status [Draft, Active, Lapsed], AnnualMaximum, Deductible, PremiumAmount)
   - Invoice (InvoiceNumber, Amount, Status [Unpaid, Paid, Overdue], DueDate)
   - Claim (ClaimNumber, CDTCode, ChargedAmount, Status [Submitted, Adjudicated, Approved, Denied])
3. A functional Backend API Server (server.js/app.js) with basic CRUD route structures for Policies, Billing, and Claims.
4. A simple,  frontend view system (Home/Dashboard page layout) that demonstrates a clear dashboard showing:
   - A Policyholder View: Displaying active policy status, current billing due, and recent claim updates.
   - An Admin/Underwriter View: A master table to switch status toggles (e.g., Approve a claim, activate a policy).
5. A quick README detailing instructions to run 'npm install' and start the server.

Keep the code clean, use basic Bootstrap/CSS for the dashboard mockup, and ensure the basic routing between the Home/Login, Dashboard, and individual forms works seamlessly. Do not include heavy business logic or algorithmic processing yet.

