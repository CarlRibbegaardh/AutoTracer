import React from "react";
import { useForm } from "react-hook-form";
import { useReactTracer } from "@autotracer/react19";

/**
 * Component demonstrating react-hook-form state tracking.
 * Tests hook label resolution for complex form state objects.
 */

export interface FormData {
  email: string;
  password: string;
  rememberMe: boolean;
  profile: {
    firstName: string;
    lastName: string;
    age: number;
  };
  tags: string[];
}

/**
 * A component using react-hook-form to test complex object state tracking.
 * Demonstrates:
 * - useForm hook with nested objects
 * - Complex form state with arrays and nested objects
 * - Multiple form methods (register, watch, setValue, etc.)
 */
export const ReactHookFormComponent: React.FC = () => {
  const logger = useReactTracer();

  // Simple form with primitive values
  const simpleForm = useForm<{ name: string; age: number }>({
    defaultValues: {
      name: "John",
      age: 25,
    },
  });
  logger.labelState(0, "simpleForm", simpleForm);

  // Complex form with nested objects and arrays
  const complexForm = useForm<FormData>({
    defaultValues: {
      email: "user@example.com",
      password: "password123",
      rememberMe: false,
      profile: {
        firstName: "Jane",
        lastName: "Doe",
        age: 30,
      },
      tags: ["developer", "react"],
    },
  });
  logger.labelState(1, "complexForm", complexForm);

  return (
    <div>
      <h2>Simple Form</h2>
      <form>
        <input {...simpleForm.register("name")} placeholder="Name" />
        <input
          {...simpleForm.register("age", { valueAsNumber: true })}
          type="number"
          placeholder="Age"
        />
        <button
          type="button"
          onClick={() => simpleForm.setValue("name", "Updated Name")}
        >
          Update Name
        </button>
        <button type="button" onClick={() => simpleForm.setValue("age", 35)}>
          Update Age
        </button>
      </form>
      <div>Name: {simpleForm.watch("name")}</div>
      <div>Age: {simpleForm.watch("age")}</div>

      <h2>Complex Form</h2>
      <form>
        <input {...complexForm.register("email")} placeholder="Email" />
        <input
          {...complexForm.register("password")}
          type="password"
          placeholder="Password"
        />
        <label>
          <input {...complexForm.register("rememberMe")} type="checkbox" />
          Remember Me
        </label>
        <input
          {...complexForm.register("profile.firstName")}
          placeholder="First Name"
        />
        <input
          {...complexForm.register("profile.lastName")}
          placeholder="Last Name"
        />
        <input
          {...complexForm.register("profile.age", { valueAsNumber: true })}
          type="number"
          placeholder="Age"
        />
        <button
          type="button"
          onClick={() => complexForm.setValue("email", "new@example.com")}
        >
          Update Email
        </button>
        <button
          type="button"
          onClick={() =>
            complexForm.setValue("profile.firstName", "Updated First")
          }
        >
          Update First Name
        </button>
        <button
          type="button"
          onClick={() => complexForm.setValue("tags", ["admin", "superuser"])}
        >
          Update Tags
        </button>
        <button type="button" onClick={() => complexForm.reset()}>
          Reset Form
        </button>
      </form>
      <div>Email: {complexForm.watch("email")}</div>
      <div>
        Profile: {complexForm.watch("profile.firstName")}{" "}
        {complexForm.watch("profile.lastName")}, Age:{" "}
        {complexForm.watch("profile.age")}
      </div>
      <div>Tags: {complexForm.watch("tags").join(", ")}</div>
    </div>
  );
};
