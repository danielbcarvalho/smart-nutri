import React from "react";
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Image,
  Font,
} from "@react-pdf/renderer";
import type {
  MealPlan,
  Meal,
} from "@/modules/meal-plan/services/mealPlanService";
import type { Patient } from "@/modules/patient/services/patientService";
import type { Alimento } from "@/modules/meal-plan/components/AddFoodToMealModal";

// Registrar fontes para o PDF
Font.register({
  family: "Open Sans",
  fonts: [
    {
      src: "https://cdn.jsdelivr.net/npm/open-sans-all@0.1.3/fonts/open-sans-regular.ttf",
    },
    {
      src: "https://cdn.jsdelivr.net/npm/open-sans-all@0.1.3/fonts/open-sans-600.ttf",
      fontWeight: 600,
    },
    {
      src: "https://cdn.jsdelivr.net/npm/open-sans-all@0.1.3/fonts/open-sans-700.ttf",
      fontWeight: 700,
    },
    {
      src: "https://cdn.jsdelivr.net/npm/open-sans-all@0.1.3/fonts/open-sans-italic.ttf",
      fontStyle: "italic",
    },
  ],
});

// Definir estilos para o PDF
const pdfStyles = StyleSheet.create({
  page: {
    padding: 40,
    backgroundColor: "#FFFFFF",
    fontFamily: "Open Sans",
  },
  header: {
    marginBottom: 20,
    paddingBottom: 10,
    borderBottom: "1pt solid #E0E0E0",
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 5,
    color: "#2E7D32",
  },
  headerSubtitle: {
    fontSize: 14,
    color: "#757575",
    marginBottom: 3,
  },
  logoContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 15,
  },
  logo: {
    width: 80,
    height: 40,
    objectFit: "contain",
  },
  nutritionistInfo: {
    fontSize: 10,
    color: "#757575",
    textAlign: "right",
  },
  patientInfo: {
    backgroundColor: "#F5F5F5",
    padding: 15,
    marginBottom: 20,
    borderRadius: 5,
  },
  patientName: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 5,
    color: "#333333",
  },
  patientDetail: {
    fontSize: 10,
    color: "#757575",
    marginBottom: 3,
  },
  planDetails: {
    marginBottom: 20,
  },
  planTitle: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 5,
    color: "#2E7D32",
  },
  planPeriod: {
    fontSize: 10,
    color: "#757575",
    marginBottom: 10,
  },
  planObjective: {
    fontSize: 12,
    backgroundColor: "#F0F7ED",
    padding: 10,
    borderRadius: 5,
    marginBottom: 15,
    color: "#2E7D32",
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: "bold",
    marginTop: 15,
    marginBottom: 10,
    color: "#333333",
    backgroundColor: "#F5F5F5",
    padding: 8,
    borderRadius: 3,
  },
  mealContainer: {
    marginBottom: 15,
    borderBottom: "1pt solid #EEEEEE",
    paddingBottom: 15,
  },
  mealHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },
  mealName: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#2E7D32",
  },
  mealTime: {
    fontSize: 10,
    color: "#757575",
    marginLeft: 10,
  },
  foodItem: {
    marginLeft: 15,
    marginBottom: 5,
    fontSize: 11,
    flexDirection: "row",
    alignItems: "center",
  },
  foodAmount: {
    width: 70,
    fontWeight: "bold",
    whiteSpace: "nowrap",
    marginRight: 8,
    textAlign: "right",
  },
  foodName: {
    flex: 1,
  },
  notes: {
    fontSize: 10,
    fontStyle: "italic",
    color: "#757575",
    marginLeft: 15,
    marginTop: 5,
    marginBottom: 10,
  },
  nutrientsSummary: {
    marginTop: 20,
    marginBottom: 20,
    padding: 15,
    backgroundColor: "#F0F7ED",
    borderRadius: 5,
  },
  nutrientTitle: {
    fontSize: 14,
    fontWeight: "bold",
    marginBottom: 10,
    color: "#2E7D32",
  },
  nutrientRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 5,
  },
  nutrient: {
    fontSize: 10,
    color: "#333333",
  },
  nutrientValue: {
    fontSize: 10,
    fontWeight: "bold",
    color: "#2E7D32",
  },
  footer: {
    position: "absolute",
    bottom: 30,
    left: 40,
    right: 40,
    fontSize: 8,
    color: "#9E9E9E",
    textAlign: "center",
    paddingTop: 10,
    borderTop: "1pt solid #E0E0E0",
  },
  pageNumber: {
    position: "absolute",
    bottom: 30,
    right: 40,
    fontSize: 8,
    color: "#9E9E9E",
  },
});

interface MealPlanPDFProps {
  plan: MealPlan;
  mealsByTime: Meal[];
  patientData?: Patient;
  nutritionistData?: {
    name?: string;
    crn?: string;
    email?: string;
  } | null;
  totalNutrients: {
    protein: number;
    fat: number;
    carbohydrates: number;
    calories: number;
    totalWeight: number;
  };
  foodDb: Alimento[];
}

export const MealPlanPDF: React.FC<MealPlanPDFProps> = ({
  plan,
  mealsByTime,
  patientData,
  nutritionistData,
  totalNutrients,
  foodDb,
}) => {
  return (
    <Document>
      <Page size="A4" style={pdfStyles.page}>
        <View style={pdfStyles.logoContainer}>
          <Image
            style={pdfStyles.logo}
            src="https://via.placeholder.com/150x70?text=LOGO" // Substitua pela URL real do logo
          />
          <View style={pdfStyles.nutritionistInfo}>
            <Text>{nutritionistData?.name || "Nutricionista"}</Text>
            <Text>{nutritionistData?.crn || "CRN 00000"}</Text>
            <Text>{nutritionistData?.email || "contato@email.com"}</Text>
          </View>
        </View>

        <View style={pdfStyles.header}>
          <Text style={pdfStyles.headerTitle}>
            Plano Alimentar Personalizado
          </Text>
          <Text style={pdfStyles.headerSubtitle}>{plan.name}</Text>
        </View>

        <View style={pdfStyles.patientInfo}>
          <Text style={pdfStyles.patientName}>
            {patientData?.name || "Paciente"}
          </Text>
          <Text style={pdfStyles.patientDetail}>
            Data de nascimento:{" "}
            {patientData?.birthDate
              ? new Date(patientData.birthDate).toLocaleDateString()
              : "N/A"}
          </Text>
          <Text style={pdfStyles.patientDetail}>
            Email: {patientData?.email || "N/A"}
          </Text>
          {patientData?.phone && (
            <Text style={pdfStyles.patientDetail}>
              Telefone: {patientData.phone}
            </Text>
          )}
        </View>

        <View style={pdfStyles.planDetails}>
          <Text style={pdfStyles.planTitle}>Informações do Plano</Text>
          <Text style={pdfStyles.planPeriod}>
            Período:{" "}
            {plan.startDate
              ? new Date(plan.startDate).toLocaleDateString()
              : "-"}
            a {plan.endDate ? new Date(plan.endDate).toLocaleDateString() : "-"}
          </Text>

          {plan.description && (
            <Text style={pdfStyles.planObjective}>
              Objetivo: {plan.description}
            </Text>
          )}
        </View>

        <Text style={pdfStyles.sectionTitle}>Refeições Diárias</Text>

        {mealsByTime.map((meal) => (
          <View key={meal.id} style={pdfStyles.mealContainer}>
            <View style={pdfStyles.mealHeader}>
              <Text style={pdfStyles.mealName}>{meal.name}</Text>
              <Text style={pdfStyles.mealTime}>{meal.time}</Text>
            </View>

            {meal.mealFoods.map((mealFood) => {
              const food = foodDb.find((f) => f.id === mealFood.foodId);
              if (!food) return null;

              const amount = parseFloat(String(mealFood.amount));
              const displayAmount = `${
                amount % 1 === 0 ? amount : amount.toFixed(2)
              } ${ajustarUnidade(String(mealFood.unit), amount)}`;

              return (
                <View
                  key={`${meal.id}-food-${mealFood.foodId}`}
                  style={pdfStyles.foodItem}
                >
                  <Text style={pdfStyles.foodAmount}>{displayAmount}</Text>
                  <Text style={pdfStyles.foodName}>{food.nome}</Text>
                </View>
              );
            })}

            {meal.notes && (
              <Text style={pdfStyles.notes}>Observações: {meal.notes}</Text>
            )}
          </View>
        ))}

        <View style={pdfStyles.nutrientsSummary}>
          <Text style={pdfStyles.nutrientTitle}>Resumo Nutricional Diário</Text>
          <View style={pdfStyles.nutrientRow}>
            <Text style={pdfStyles.nutrient}>Calorias</Text>
            <Text style={pdfStyles.nutrientValue}>
              {Math.round(totalNutrients.calories)} kcal
            </Text>
          </View>
          <View style={pdfStyles.nutrientRow}>
            <Text style={pdfStyles.nutrient}>Proteínas</Text>
            <Text style={pdfStyles.nutrientValue}>
              {Math.round(totalNutrients.protein)} g
            </Text>
          </View>
          <View style={pdfStyles.nutrientRow}>
            <Text style={pdfStyles.nutrient}>Carboidratos</Text>
            <Text style={pdfStyles.nutrientValue}>
              {Math.round(totalNutrients.carbohydrates)} g
            </Text>
          </View>
          <View style={pdfStyles.nutrientRow}>
            <Text style={pdfStyles.nutrient}>Gorduras</Text>
            <Text style={pdfStyles.nutrientValue}>
              {Math.round(totalNutrients.fat)} g
            </Text>
          </View>
        </View>

        <View style={pdfStyles.footer}>
          <Text>
            Este plano alimentar foi desenvolvido por{" "}
            {nutritionistData?.name || "seu nutricionista"} exclusivamente para{" "}
            {patientData?.name || "você"}.
          </Text>
          <Text>
            As necessidades nutricionais variam de pessoa para pessoa. Consulte
            seu nutricionista antes de realizar quaisquer alterações.
          </Text>
        </View>

        <Text
          style={pdfStyles.pageNumber}
          render={({ pageNumber, totalPages }) =>
            `${pageNumber} / ${totalPages}`
          }
          fixed
        />
      </Page>
    </Document>
  );
};

function ajustarUnidade(unidade: string, quantidade: number) {
  if (unidade.endsWith("(s)")) {
    return quantidade === 1
      ? unidade.replace("(s)", "")
      : unidade.replace("(s)", "s");
  }
  return unidade;
}
